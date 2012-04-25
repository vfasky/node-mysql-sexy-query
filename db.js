var mysql = require('mysql');
//Enable mysql-queues
var queues = require('mysql-queues');

var core = require('./base');

//存放连接
var mysqlClient = false , client;

var debug = false;

//创建连接
exports.createClient = function(cfg){
	//if (false !== mysqlClient ) return mysqlClient;
	console.log('create mysql Client');
	client = mysql.createClient(cfg);

	debug = cfg.debug ? true : false;

	queues(client, debug);

	mysqlClient = client.createQueue();

	return mysqlClient;
};

/**
 * 构造查询
 * @param  {String} table 表名
 * @param  {undefined} undef undefined
 * @return {Object}      
 */
exports.query = function( table , undef ){
	var _select = '*';
	var _from   = table;
	var _where  = [];
	var _join   = [];
	var _group  = false;
	var _limit  = 1;
	var _offset = 0;
	var _order  = false;
	var _sql    = '';
	var _attr   = [];
	var _action = 'SELECT';



    
	/**
	 * 参数
	 * @type {Object}
	 */
	var _param  = {
		where : [] ,
		attr : []
	};

	/**
	 * 分页信息
	 */
	var _page , _pageSize;

	/**
	 * 闭包
	 * @type {this}
	 */
	var _self   = this;

	/**
	 * 不做转义的关键字
	 * @type {Array}
	 */
	var _condition = ['AND' , '=' , '!=' , '<>' , 
	                  '>=' , '>' , '<=' , '<' , 
	                  'IN' , 'OR' , '(' , ')' , 
	                  'ON' , 'AS' ,
	                  'GROUP' , 'ORDER' , 'BY' ,
	                  'COUNT' , '*' , '?'];

	/**
	 * 元数据绑定
	 * @type {Boolean}
	 */
	this.meta = false;

	/**
	 * 转义字段
	 * @param  {String} field 需要转义的字段
	 * @return {String}       转义的字段
	 */
	this.filterColumn = function(field){
		
		field = core.trim(field);
	
		if( false == core.inArray( field.toUpperCase(), _condition ) )
		{
			var temp  = field.split(' ');
			var count = temp.length
			if( count == 1 )
			{
				var temp2 = field.split('.');
				if( temp2.length == 1 )
				{
					return '`' + field + '`';
					
				}
				return '`' + temp2[0] + '`.`' + temp2[1] + '`';
				
				
			}
			//处理 AS 
			else if( count == 3 )
			{
				var temp2 = temp[0].split('.');
				if( temp2.length == 1 )
				{
					return '`' + temp[0] + '` ' +  temp[1] + ' `' + temp[2] + '`';
			
				}
				else //处理 t.id AS ID
				{
					return '`' + temp2[0] + '`.`' + temp2[1] + '` ' +  temp[1] + ' `' + temp[2] + '`';
		
				}
			}

		}
		return field;
	}

	/**
	 * join 查询
	 * @param  {String} join 关联条件 join('type as T ON I.id = T.id')
	 * @return {this}     
	 */
	this.join = function( join ){
		join = core.trim(join).split(' ');
		var temp = [];
		core.each(join , function(v){
			temp[ temp.length ] = _self.filterColumn( v );
		});
		_join[ _join.length ] = 'INNER JOIN ' + temp.join(' ') + ' ';
		return _self;
	};

	/**
	 * left join 查询
	 * @param  {String} join 关联条件 join('type as T ON I.id = T.id')
	 * @return {this}     
	 */
	this.leftJoin = function( join ){
		join = core.trim(join).split(' ');
		var temp = [];
		core.each(join , function(v){
			temp[ temp.length ] = _self.filterColumn( v );
		});
		_join[ _join.length ] = 'LEFT JOIN ' + temp.join(' ') + ' ';
		return _self;
	};

	/**
	 * right join 查询
	 * @param  {String} join 关联条件 join('type as T ON I.id = T.id')
	 * @return {this}     
	 */
	this.rightJoin = function( join ){
		join = core.trim(join).split(' ');
		var temp = [];
		core.each(join , function(v){
			temp[ temp.length ] = _self.filterColumn( v );
		});
		_join[ _join.length ] = 'RIGHT JOIN ' + temp.join(' ') + ' ';
		return _self;
	};

	//查询
	this.select = function( fields ){
		//设为查询
		_action = 'SELECT';
		fields  = fields.split(',');
		var select = [];
		core.each(fields , function(field){
			select[ select.length ] = _self.filterColumn(field);
		});

		_select = select
		//console.log( select );
		
		return _self;

	};

	//添加
	this.add = function(attr , callback){
		_action = 'INSERT';

		for(k in attr)
		{
			_attr[ _attr.length ] = _self.filterColumn(k);
			_param.attr[ _param.attr.length ] = attr[k];
		}

		var sql = this.sql();
		//console.log( sql );
		mysqlClient.query( sql , function selectCb(err, results, fields) {
		    if (err) {
		      throw err;
		    }
		    if( core.isFunction(callback) )
		    {
		    	callback( results.insertId , results)
		    }
		    //console.log(results);
		    
		});
		return _self;
	};

	//删除
	this.delete = function(callback){
		_action = 'DELETE';
		var sql = this.sql();
		console.log( sql );
		mysqlClient.query( sql , function selectCb(err, results, fields) {
		    if (err) {
		      throw err;
		    }
		    if( core.isFunction(callback) )
		    {
		    	callback( results.affectedRows , results)
		    }
		    //console.log(results);
		    
		});
		return _self;
	}

	//保存
	this.save = function(attr , callback){
		_action = 'UPDATE';

		for(k in attr)
		{
			_attr[ _attr.length ] = _self.filterColumn(k);
			_param.attr[_param.attr.length ] = attr[k];
		}

		var sql = this.sql();
		//console.log( sql );
		mysqlClient.query( sql , function selectCb(err, results, fields) {
		    if (err) {
		      throw err;
		    }
		    if( core.isFunction(callback) )
		    {
		    	callback( results.affectedRows , results)
		    }
		    //console.log(results);
		    
		});
		return _self;
	};

	this.where = function(condition){
		condition  = core.trim( condition );
		conditions = condition.split(' ');
		var where = ''

		core.each( conditions , function( v , k ){
			where += ' ' + _self.filterColumn( v ) + ' '
		} );

		where = ( _where.length > 0 ) ? ' AND (' + where + ')' : '(' + where + ')';

		_where[ _where.length ] = where;

		core.each( arguments , function( v , k ){
			if( k > 0 )
			{
				_param.where[ _param.where.length ] = v;
			}
		} );

		//console.log( _where );
		return _self;
	};

	this.orWhere = function(condition){
		condition  = core.trim( condition );
		conditions = condition.split(' ');
		var where = '';

		core.each( conditions , function( v , k ){
			where += ' ' + _self.filterColumn( v ) + ' '
		} );

		where = ( _where.length > 0 ) ? ' OR (' + where + ')' : '(' + where + ')';

		_where[ _where.length ] = where;

		core.each( arguments , function( v , k ){
			if( k > 0 )
			{
				_param.where[ _param.where.length ] = v;
			}
		} );

		//console.log( _where );
		return _self;
	};

	this.page = function(page , pageSize){
		_page     = page ? Number(page) : 1;
		_pageSize = pageSize ? Number(pageSize) : 10;
	
		this.limit(  _pageSize , ( _page - 1 ) * _pageSize )
		return _self;
	}

	this.group = function(group){
		groups = core.trim(group).split(',');
		var temp = [];
		core.each(groups , function(v){
			temp[ temp.length ] = _self.filterColumn(v);
		});

		_group = temp.join(',');
		return _self;
	};

	this.order = function(order){
		orders = core.trim(order).split(',');
		var temp = []
		core.each( orders , function(v){
			var temp2 = core.trim(v).split(' ');
			temp2[0] = _self.filterColumn( temp2[0] );
			if( temp2.length == 1 )
			{
				temp2[1] = 'ASC';
			}

			temp[ temp.length ] = temp2[0] + ' ' + temp2[1];
		} )
		//console.log( temp );
		_order = temp.join(',');
		return _self;
	};

	this.limit = function( offset , limit ){
		_limit = limit ? Number(limit) : 0;
		_offset = offset ? Number(offset) : 1;
		return _self;
	};

	this.countSql = function(){
		var sql = 'SELECT COUNT(*) as `row_count` FROM ' + _self.filterColumn( _from );
		core.each( _join , function(v){
			sql += ' ' + v;
		});

		if( _where.length > 0 )
		{
			sql += ' WHERE (' + _where.join(' ') + ') ';
		}
		if( false != _group )
		{
			sql += ' GROUP BY ' + _group + ' ';
		}

	

		if( debug == true )
		{
			console.log( client.format(sql , _param.where) );
		}

		return client.format(sql , _param.where);

	};

	this.count = function( callback ) {
		callback = callback || function () {};

		mysqlClient.query( this.countSql() , function selectCb(err, results, fields) {
		    if (err) {
		      throw err;
		    }
		
		    callback( Number(results[0].row_count) );
		    // console.log(results);
		    // console.log(fields);
		});

		return _self;
	};

	this.get = function() {
		var callback = arguments[ arguments.length - 1 ] || function () {};
		var number   = core.isFunction( arguments[0] ) ? 1 : Number(arguments[0]);

		this.limit(number);

		var sql = this.sql();

		//console.log( sql );

		mysqlClient.query( sql , function selectCb(err, results, fields) {
		    if (err) {
		      throw err;
		    }
		    //console.log( _self.meta );
		    if( number == 1 )
		    {		    	
		    	if( results[0] )
		    	{
		    		var data = results[0];
		    		if( false != _self.meta )
		    		{
		    			data = new _self.meta(data);
		    		}
		    	}
		    	else
		    	{
		    		var data = false
		    	}

		    	return callback( data );
		    }
			
			if( false != _self.meta )
		    {
		    	var data = [];
		    	core.each( results , function( v , k){
		    		data[k] = new _self.meta(v);
		    	});
		    	return callback( data );
		    }	
		    callback( results );
		    // console.log(results);
		    // console.log(fields);
		});

		return _self;
	};

	this.query = function( callback ){
		var sql = this.sql();
		mysqlClient.query( sql , function selectCb(err, results, fields) {
		    if (err) {
		      throw err;
		    }
		    // console.log( sql );
		    // console.log( results );
		    
		    if( false != _self.meta )
		    {
		    	var data = [];
		    	core.each( results , function( v , k){
		    		data[k] = new _self.meta(v);
		    	});
		    	results = data;
		    }

		    if( _page == undef ) return callback( results );

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
		return _self;
	}

	this.execute = function(){
		mysqlClient.execute();
	};

	this.sql = function(){
		var sql = '';
		switch(_action){
			case 'SELECT':
				sql = 'SELECT ' + _select + ' FROM ' + _self.filterColumn( _from );
				core.each( _join , function(v){
					sql += ' ' + v;
				});

				if( _where.length > 0 )
				{
					sql += ' WHERE (' + _where.join(' ') + ') ';
				}
				if( false != _group )
				{
					sql += ' GROUP BY ' + _group + ' ';
				}
				if( false != _order )
				{
					sql += ' ORDER BY ' + _order + ' ';
				}
				sql += ' LIMIT ' + _limit + ' , ' + _offset
				break;
			case 'INSERT':
				sql = 'INSERT INTO ' + _self.filterColumn( _from ) + ' (';
				sql += _attr.join(',') + ') VALUES (';

				placeholder = [];
				core.each( _attr , function(){
					placeholder[ placeholder.length ] = '?';
				} );

				sql += placeholder.join(',') + ')';
				//sql += ' LIMIT ' + _limit + ' , ' + _offset
				
				break;
			case 'UPDATE' :
				sql = 'UPDATE ' + _self.filterColumn( _from ) + ' SET ';

				var columns = [];
				core.each( _attr , function(v){
					columns[ columns.length ] = v + ' = ?';
				} );
				sql += columns.join(',')
				if( _where.length > 0 )
				{
					sql += ' WHERE (' + _where.join(' ') + ' ) ';
				}
				break;
			case 'DELETE' :
				sql = 'DELETE FROM ' + _self.filterColumn( _from ) ;
				if( _where.length > 0 )
				{
					sql += ' WHERE (' + _where.join(' ') + ' ) ';
				}
				break;

		}
		var param = [];
		core.each( _param.attr , function(v){
			param[ param.length ] = v;
		} );
		core.each( _param.where , function(v){
			param[ param.length ] = v;
		} );

	
		if( debug == true )
		{
			console.log( client.format(sql , _param.where) );
		}

		return client.format(sql , param);
		//console.log( _param );
		//return sql;
	}
};

exports.execute = function(){
	mysqlClient.execute();
};

exports.use = function(table){
	return new exports.query(table);
}
