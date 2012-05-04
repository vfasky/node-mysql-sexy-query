/**
 * sql 构造器
 * @author vfasky@gmail.com
 */


/**
 * 构造查询
 * @param  {String} table 表名
 * @param  {undefined} undef undefined
 * @return {Object}      
 */
exports = module.exports = function( table , undef ){
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

	this.getPage = function(){
		return _page;
	};  

	this.getPageSize = function(){
		return _pageSize;
	};                 

	/**
	 * 转义字段
	 * @param  {String} field 需要转义的字段
	 * @return {String}       转义的字段
	 */
	this.filterColumn = function(field){
		
		field = _self.trim(field);
	
		if( false == _self.inArray( field.toUpperCase(), _condition ) )
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
	};

	this.isFunction = function (x) {
	      switch(typeof x) {
	      	case "function" : return true ;
	        case "object"   :
	          if ( "function" !== typeof x.toString )
	               return (x + "").match(/function/) !== null ;
	          else
	               return Object.prototype.toString.call(x) === "[object Function]" ;
	          break ;
	        default  : return false ;
	      }
	};

	

	this.inArray = function(item , array){
		var isIn = false;
		this.each( array , function( v ){
			if( item === v )
			{
				isIn = true;
				return false;
			}
		} )
		return isIn;
	};

	/**
	 * escape
	 * @param  {String|Array} val 要过滤的值
	 * @return {String}     过滤后的值
	 */
	this.escape = function(val) {
	  var escape = this.escape;

	  if (val === undefined || val === null) {
	    return 'NULL';
	  }

	  switch (typeof val) {
	    case 'boolean': return (val) ? 'true' : 'false';
	    case 'number': return val+'';
	  }

	  if (Array.isArray(val)) {
	    var sanitized = val.map( function( v ) { return escape( v ); } );
	    return "'" + sanitized.join( "','" ) + "'";
	  }

	  if (typeof val === 'object') {
	    val = (typeof val.toISOString === 'function')
	      ? val.toISOString()
	      : val.toString();
	  }

	  val = val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function(s) {
	    switch(s) {
	      case "\0": return "\\0";
	      case "\n": return "\\n";
	      case "\r": return "\\r";
	      case "\b": return "\\b";
	      case "\t": return "\\t";
	      case "\x1a": return "\\Z";
	      default: return "\\"+s;
	    }
	  });
	  return "'"+val+"'";
	};

	/**
	 * 格式化 sql
	 * @param  {String} sql    
	 * @param  {Array} params 参数
	 * @return {String}        格式化后的sql
	 */
	this.format = function(sql, params) {
	  var escape = this.escape;
	  //console.log( params ) 
	  params = params.concat();

	  sql = sql.replace(/\?/g, function(k) {
	    if (params.length == 0) {
	      throw new Error('too few parameters given');
	    }
	    return escape(params.shift());
	  });

	  if (params.length) {
	    throw new Error('too many parameters given');
	  }

	  return sql;
	};

	/**
	 * each 数组
	 * @param  {Array}   array   
	 * @param  {Function} callback [description]
	 */
	// this.each = function( array , callback ){
	// 	if( undef == callback ) return false;
	// 	//if( false == Array.isArray(array) ) return false;
	// 	for( k in array )
	// 	{
	// 		callback( array[k] , k );
	// 	}
	// };

	this.each = function( array , callback ){
		if( undef == callback ) return false;
		//console.log(Array.isArray(array));
		if (Array.isArray(array)) {
			var count = array.length;
			for(var i=0; i<count; i++)
			{
				var ret = callback( array[i] , i );
				if( false === ret )
				{
					break;
				}
			}
		}
		else{
			for( var k in array )
			{
				var ret = callback( array[k] , k );
				if( false === ret )
				{
					break;
				}
			}
		}
	};

	/**
	 * 去空两边空格
	 * @param  {String} str [description]
	 * @return {String}     [description]
	 */
	this.trim = function(str)
	{
		if (typeof str === 'string') {
			return str.trim();
			//return str.replace(/(^\s*)|(\s*$)/g, "");
		} 
	};

	/**
	 * join 查询
	 * @param  {String} join 关联条件 join('type as T ON I.id = T.id')
	 * @return {this}     
	 */
	this.join = function( join ){
		join = _self.trim(join).split(' ');
		var temp = [];
		_self.each(join , function(v){
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
		join = _self.trim(join).split(' ');
		var temp = [];
		_self.each(join , function(v){
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
		join = _self.trim(join).split(' ');
		var temp = [];
		_self.each(join , function(v){
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
		_self.each(fields , function(field){
			select[ select.length ] = _self.filterColumn(field);
		});

		_select = select
		//console.log( select );
		
		return _self;

	};

	//添加
	this.add = function(attr){
		_action = 'INSERT';

		for(var k in attr)
		{
			_param.attr[ _param.attr.length ] = attr[k];
			_attr[ _attr.length ] = _self.filterColumn(k);
			
		}

		return this.sql();
		
	};

	//删除
	this.delete = function(){
		_action = 'DELETE';
		return this.sql();
	}

	//保存
	this.save = function(attr){
		_action = 'UPDATE';

		for(var k in attr)
		{
			_param.attr[ _param.attr.length ] = attr[k];
			_attr[ _attr.length ] = _self.filterColumn(k);
			
		}
		//console.log( _attr );
		//console.log( _param.attr );
		return this.sql();
	};

	this.where = function(condition){
		
		condition  = _self.trim( condition );
		conditions = condition.split(' ');
		var where = ''

		_self.each( conditions , function( v , k ){
			where += ' ' + _self.filterColumn( v ) + ' '
		} );

		where = ( _where.length > 0 ) ? ' AND (' + where + ')' : '(' + where + ')';

		_where[ _where.length ] = where;

		//console.log( arguments );
		_self.each( arguments , function( v , k ){
			//console.log( k );
			//console.log( v );
			if( k > 0 )
			{
				_param.where[ _param.where.length ] = v;
			}
		} );

		
		return _self;
	};

	this.orWhere = function(condition){
		condition  = _self.trim( condition );
		conditions = condition.split(' ');
		var where = '';

		_self.each( conditions , function( v , k ){
			where += ' ' + _self.filterColumn( v ) + ' '
		} );

		where = ( _where.length > 0 ) ? ' OR (' + where + ')' : '(' + where + ')';

		_where[ _where.length ] = where;

		_self.each( arguments , function( v , k ){
			if( k > 0 )
			{
				_param.where[ _param.where.length ] = v;
			}
		} );

		//console.log( _where );
		return _self;
	};

	//orWhere别名
	this.or = this.orWhere;

	this.page = function(page , pageSize){
		_page     = page ? Number(page) : 1;
		_pageSize = pageSize ? Number(pageSize) : 10;
	
		_self.limit(  _pageSize , ( _page - 1 ) * _pageSize )
		return _self;
	}

	this.group = function(group){

		groups = _self.trim(group).split(',');
		var temp = [];
		_self.each(groups , function(v){
			temp[ temp.length ] = _self.filterColumn(v);
		});

		_group = temp.join(',');
		return _self;
	};

	this.order = function(order){
		orders = _self.trim(order).split(',');
		var temp = []
		_self.each( orders , function(v){
			var temp2 = _self.trim(v).split(' ');
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
		_self.each( _join , function(v){
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
		return _self.format(sql , _param.where);

	};

	this.sql = function(){
		var sql = '';
		switch(_action){
			case 'SELECT':
				sql = 'SELECT ' + _select + ' FROM ' + _self.filterColumn( _from );
				_self.each( _join , function(v){
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
				_self.each( _attr , function(){
					placeholder[ placeholder.length ] = '?';
				} );

				sql += placeholder.join(',') + ')';
				//sql += ' LIMIT ' + _limit + ' , ' + _offset
				
				break;
			case 'UPDATE' :
				sql = 'UPDATE ' + _self.filterColumn( _from ) + ' SET ';

				var columns = [];
				_self.each( _attr , function(v){
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
		_self.each( _param.attr , function(v){
			param[ param.length ] = v;
		} );
		_self.each( _param.where , function(v){
			param[ param.length ] = v;
		} );

		return _self.format(sql , param);
	
	}
};
