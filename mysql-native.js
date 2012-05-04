//引进 sql 构造器
var query = require('./query.js');
var mysql = require('mysql-native');
var cfg   = {};
//存放连接
var connection = false;

//创建连接
var createClient = function(){
	
	cfg.client  = cfg.client || 'TCP';
	cfg.charset = cfg.charset || 'utf8_general_cs';
	switch( cfg.client ){
		case 'UNIX' :
			cfg.path = cfg.path || false;
			var db = mysql.createUNIXClient( cfg.path );
			break;
		default :
			var db = mysql.createTCPClient( cfg.host , cfg.port );	
	}
	
	db.set('auto_prepare' , false);
	db.set('charset' , cfg.charset);
	db.auth( cfg.database , cfg.user, cfg.password);
	db.query("SET NAMES '"+ cfg.charset.split('_')[0] +"'");
	return db;
};


exports.createClient = function(config){
	cfg = config;
	return exports.query;
};

/**
 * 关闭连接
 * @return {[type]} [description]
 */
exports.close = function(){
	if( connection )
	{
		connection.close();
		connection = false;
		console.log('end mysql Client');
	}
};

/**
 * 连接数据库
 * @return {[type]} [description]
 */
exports.connection = function(){
	if( connection ) return connection;
	connection = createClient();
	console.log('create mysql Client');
	return connection;
};

exports.Query = function( table ){
	//查询对象
	var _query = new query( table );

	var _attr = ['join' , 'leftJoin' , 
	             'rightJoin' , 'select' , 
	             'where' , 'orWhere' , 'or' , 
	             'order' , 'limit' ,
	             'page' , 'group'];

	

	var _self = this;

	_query.each( _attr , function(v){
		_self[ v ] = function(){
			_query[ v ].apply( null , arguments );
			return _self;		 
		};
	} );

	/**
	 * 元数据绑定
	 * @type {Boolean}
	 */
	this.Meta = false;

	/**
	 * 连接数据库
	 * @return {[type]} [description]
	 */
	this.connection = function(){
		return exports.connection();
	};

	/**
	 * 关闭连接
	 * @return {[type]} [description]
	 */
	this.close = function(){
		exports.close();
	};

	this.sql = function(){
		return _query.sql();
	};

	/**
	 * 统计查询
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	this.count = function( callback ){
		var sql = _query.countSql();
		var ret = 0;
		this.connection().query( sql ).on('row', function(result) {
			ret = Number(result.row_count)
	    }).on('end', function() {
	    	return callback( ret );
	    }).on('error', function(error) {
	        _self.close();
	        throw error;
	    });
	};

	/**
	 * 保存数据
	 * @param  {[type]}   attr     [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	this.save = function( attr , callback ){
		var sql = _query.save( attr );
		//console.log( sql );

		this.connection().query( sql ).on('end', function() {
		    if( _query.isFunction(callback) )
		    {
		    	callback( this.result.affected_rows , this.result);
		    }
		}).on('error', function(error) {
	        _self.close();
	        throw error;
	    });
		return this;
	};

	/**
	 * 删除数据
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	this.delete = function( callback ){
		var sql = _query.delete();
		//console.log( sql );

		this.connection().query( sql ).on('end', function() {
		    if( _query.isFunction(callback) )
		    {
		    	callback( this.result.affected_rows , this.result);
		    }
		}).on('error', function(error) {
	        _self.close();
	        throw error;
	    });
		return this;
	};

	/**
	 * 添加数据
	 * @param {[type]}   attr     [description]
	 * @param {Function} callback [description]
	 */
	this.add = function( attr , callback ){
		var sql = _query.add( attr );
		//console.log( sql );

		this.connection().query( sql ).on('end', function() {
		    if( _query.isFunction(callback) )
		    {
		    	callback( this.result.insert_id , this.result);
		    }
		}).on('error', function(error) {
	        _self.close();
	        throw error;
	    });
		return this;
	};

	/**
	 * 查询多条数据,并返回分页信息
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	this.query = function( callback ){
		var sql = _query.sql();
		//console.log( sql );

		callback = callback || function(){};

		var ret = false;

		this.connection().query( sql ).on('row', function(result) {
			if( false == ret ) ret = [];

			if( false != _self.Meta )
		    {
		    	result = new _self.Meta(result);
		    }

			ret[ret.length] = result;
	    }).on('end', function() {
	    	
	    	if( false == ret ) return callback( ret , {} );

			var _page     = _query.getPage();
			var _pageSize = _query.getPageSize();

		    if( _page == undefined ) return callback( ret );

		    //计算分页信息
		    _self.count( function(count){
		    	//console.log(count);
		    	var countPage = Math.ceil( count / _pageSize );
			    var prev = _page <= 1 ? 1 : _page - 1;
	            var next = _page < countPage ? _page + 1 : countPage;

	            return callback( ret , {
	            	count : count ,
	            	countPage : countPage ,
	            	prev : prev ,
	            	current : _page ,
	            	next : next ,
	            	pageSize : _pageSize
	            } );
		    } );

	    }).on('error', function(error) {
	        _self.close();
	        throw error;
	    });
		return this;
	};	

	this.get = function(){
		var callback = arguments[ arguments.length - 1 ] || function () {};
		var number   = _query.isFunction( arguments[0] ) ? 1 : Number(arguments[0]);

		_query.limit(number);

	
		var ret = false;
		
		this.connection().query( _query.sql() ).on('row', function(result) {
			if( false != _self.Meta )
		    {
		    	result = new _self.Meta(result);
		    }
			if( number == 1 ) return ret = result;
			if( false == ret ) ret = [];
			ret[ret.length] = result;
	    }).on('end', function() {
	    	return callback( ret );
	    }).on('error', function(error) {
	        _self.close();
	        throw error;
	    });
	};
}



exports.use = function(table){
	return new exports.Query(table);
};