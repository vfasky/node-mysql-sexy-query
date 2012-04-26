//引进 sql 构造器
var query = require('./query.js');
var mysql = require("mysql-native");
var cfg   = {};

//创建连接
var createClient = function(){
	console.log('create mysql Client');
	cfg.client = cfg.client || 'TCP';
	switch( cfg.client ){
		case 'UNIX' :
			cfg.path = cfg.path || false;
			var db = mysql.createUNIXClient( cfg.path );
			break;
		default :
			var db = mysql.createTCPClient( cfg.host , cfg.port );	
	}
	db.auto_prepare = true;
	db.auth( cfg.database , cfg.user, cfg.password);
	return db;
}
exports.createClient = function(config){
	//if (false !== mysqlClient ) return mysqlClient;
	cfg = config;
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

	this.get = function(){
		var callback = arguments[ arguments.length - 1 ] || function () {};
		var number   = _query.isFunction( arguments[0] ) ? 1 : Number(arguments[0]);

		_query.limit(number);

		var db = createClient();
		var ret = false;
		db.query( _query.sql() ).addListener('row', function(result) {
			return ret = result;
	    }).addListener('end', function() {
	    	db.close();
	    	return callback( ret );
	    });

	}
}