var MySQLPool = require("mysql-pool").MySQLPool;
//引进 sql 构造器
var query = require('./query.js');

var pool;

//创建连接
exports.createClient = function(cfg){
	
	cfg.poolSize = cfg.poolSize || 4;
	pool = new MySQLPool( cfg );
	return exports.query;
};

exports.query = function( table ){
	//查询对象
	var _query = new query( table );

	var _attr = ['join' , 'leftJoin' , 
	             'rightJoin' , 'select' , 
	             'where' , 'orWhere' , 
	             'order' , 'limit' ,
	             'page' , 'group'];

	var _self = this;
	for( k in _attr )
	{
		(function(attr){
			_self[ attr ] = function(){
				_query[ attr ].apply( null , arguments );
				return _self;		 
			};
		})(_attr[ k ])
	}

	/**
	 * 元数据绑定
	 * @type {Boolean}
	 */
	this.meta = false;

	this.end = function(){
		return pool.end();
	};

	this.close = this.end;

	this.destroy = function(){
		return pool.destroy();
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

		
		pool.query( sql , function selectCb(err, results, fields) {
		    if (err) {
		      throw err;
		    }
		    if( _query.isFunction(callback) )
		    {
		    	callback( results.affectedRows , results);
		    }
		});
		return this;
	};

	/**
	 * 保存数据
	 * @param  {[type]}   attr     [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	this.add = function( attr , callback ){
		var sql = _query.add( attr );
		//console.log( sql );
		
		pool.query( sql , function selectCb(err, results, fields) {
		    if (err) {
		      throw err;
		    }
		    if( _query.isFunction(callback) )
		    {
		    	callback( results.insertId , results);
		    }
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
		pool.query( sql , function selectCb(err, results, fields) {
		    if (err) {
		      throw err;
		    }
		    if( _query.isFunction(callback) )
		    {
		    	callback( results.affectedRows , results)
		    }
		    //console.log(results);
		    
		});
		return this;
	};

	/**
	 * 统计
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	this.count = function( callback ){
		var sql = _query.countSql();
		//console.log( sql );

		pool.query( sql , function selectCb(err, results, fields) {
		    if (err) {
		      throw err;
		    }
			if( _query.isFunction(callback) )
		    {
		    	callback( Number(results[0].row_count) );
		    }
		    
		    // console.log(results);
		    // console.log(fields);
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

		pool.query( sql , function selectCb(err, results, fields) {
		    if (err) {
		      throw err;
		    }
		    // console.log( sql );
		    // console.log( results );
		    
		    if( false != _self.meta )
		    {
		    	var data = [];
		    	_query.each( results , function( v , k){
		    		data[k] = new _self.meta(v);
		    	});
		    	results = data;
		    }

		    var _page = _query.getPage();
		    var _pageSize = _query.getPageSize();

		    if( _page == undefined ) return callback( results );

		    //计算分页信息
		    _self.count( function(count){
		    	var countPage = Math.ceil( count / _pageSize );
			    var prev = _page <= 1 ? 1 : _page - 1;
	            var next = _page < countPage ? _page + 1 : countPage;

	            callback( results , {
	            	count : count ,
	            	countPage : countPage ,
	            	prev : prev ,
	            	current : _page ,
	            	next : next ,
	            	pageSize : _pageSize
	            } );
		    } );
		    
		    
		});

		return this;
	}	

	/**
	 * 取指定条数的数据
	 * @return {[type]} [description]
	 */
	this.get = function(){
		var callback = arguments[ arguments.length - 1 ] || function () {};
		var number   = _query.isFunction( arguments[0] ) ? 1 : Number(arguments[0]);
		//console.log( number );
		_query.limit(number);

		pool.query( _query.sql() , function selectCb(err, results, fields) {
		    if (err) {
		      throw err;
		    }

		    var data = false
		    if( number == 1 )
		    {		    	
		    	if( results[0] )
		    	{
		    		data = results[0];
		    		if( false != _self.meta )
		    		{
		    			data = new _self.meta(data);
		    		}
		    	}
		    	return callback( data );
		    }
			
			if( false != _self.meta )
		    {
		    	data = [];
		    	core.each( results , function( v , k){
		    		data[k] = new _self.meta(v);
		    	});
		    	return callback( data );
		    }	
		    callback( results );
		    // console.log(results);
		    // console.log(fields);
		});
		return this;
	}
};

exports.use = function(table){
	return new exports.query(table);
}