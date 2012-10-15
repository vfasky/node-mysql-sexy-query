
class Query

    # 表名
    table_name : null


    # 适配器
    adapter : (sql, args, callback) ->

    @create_connection : ->

    @self :
        @


    ###
    查询接口:
    
    ```` js

        user = User.find('id = ?' , 1);
        console.log(user.get());

    ````

    ###
    @find : (condition = null , args...) ->
        query = new @
        if condition == null
            return query
        query.where.apply(query , arguments)

    @as : (as) ->
        query = new @
        query.as as

    @add : (data) ->
        query = new @
        query.add data

    constructor: ->
        @_select = []
        @_where  = []
        @_joins  = []
        @_order  = ''
        @_group  = ''
        @_having = null
        @_limit  = null
        @_offset = null
        # 表别名
        @_as = null
        # 指定查询类型
        @_query_type = 'SELECT'

        # 存放点位符对应的值
        @_args = []

        @_attr = {}

        @_page      = null
        @_page_size = null

        @_key = [
            "!" , "=" , "<" , ">" ,
            '(' , ')' , '?' , '*' , ',' ,
            'IN' , 'ON' , 'NOT' , 'AS' , 'AND' , 'OR' , 'NULL' , 'IS' ,
            'SELECT' , 'FROM' , 'JOIN' , 'LEFT' , 'RIGHT' , 'INNER' ,
            'COUNT' , 'MAX' , 'MIN' , 'AVG' , 'SUM' ,
            'WHERE' , 'ORDER' , 'ASC' , 'DESC' ,
            'GROUP' , 'HAVING' , 'LIMIT' , 'OFFSET' ,
        ]

    execute : (callback)->
        @adapter(@to_sql(), @_args, callback)

    as : (as) ->
        @_as = as.trim()
        @

    ###
    查询条件 "and"：

    ```` js
    
        user = User.find('id = ?' , 1);
        user.where('sex != 0');
        console.log(user.get());

    ````
    ###
    where : (condition = null , args...) ->
        if condition != null
            @_where.push 
                type : 'AND' ,
                condition : condition.trim() , 
                args : args
        @

    ###
    查询条件 "or"：

    ```` js
    
        user = User.find('id = ?' , 1);
        user.or('sex = 1');
        console.log(user.get());

    ````
    ###
    or : (condition = null , args...) ->
        if condition != null
            @_where.push 
                type : 'OR' ,
                condition : condition.trim() , 
                args : args
        @

    ###
    选择字段：

    ```` js
    
        user = User.find('id = ?' , 1);
        user.select('id , name');
        // or
        user.select(['id' , 'name'])
        console.log(user.get());

    ````
    ###
    select : (fields) ->
        @_select = []
        if false == Array.isArray fields
            fields = fields.split ','

        fields = ( field.trim() for field in fields )

        for v in fields
            if v.indexOf('.') == -1
                v = @_get_table_as() + '.' + v
            if v not in @_select
                @_select.push v
        @

    join : (table , condition , args...) ->
        if @is_string table
            table = @encode_sql table
        else if table._get_table_name
            table = @encode_sql table._get_table_name()
        else
            return new Error 'table type Error'

        @_joins.push 
            type : 'INNER',
            table : table ,
            condition : condition.trim() , 
            args : args

        @

    left_join : (table , condition , args...) ->
        if @is_string table
            table = @encode_sql table
        else if table._get_table_name
            table = @encode_sql table._get_table_name()
        else
            return new Error 'table type Error'

        @_joins.push 
            type : 'LEFT',
            table : table ,
            condition : condition.trim() , 
            args : args

        @

    right_join : (table , condition , args...) ->
        if @is_string table
            table = @encode_sql table
        else if table._get_table_name
            table = @encode_sql table._get_table_name()
        else
            return new Error 'table type Error'

        @_joins.push 
            type : 'RIGHT',
            table : table ,
            condition : condition.trim() , 
            args : args

        @

    group : (condition) ->
        @_group = " GROUP BY #{@encode_sql condition}"
        @

    order : (condition) ->
        @_order = " ORDER BY #{@encode_sql condition}"

    limit : (limit , offset = 0) ->
        @_limit  = Number(limit)
        @_offset = Number(offset)
        @

    page : (page = 1 , page_size = 10) ->
        @_page      = Number page
        @_page_size = Number page_size
        @limit(@_page_size , (@_page - 1) * @_page_size)

    ###
        取分页对象
    ###
    get_pagination : (callback)->
        if @_page == null or @_page_size == null
            return callback false
        query = new @.constructor.self

        for k of @
            query[k] = @[k]

        query.count (count) =>
            count_page = Math.ceil( count / @_page_size ) 
            prev       = 1 
            next       = count_page

            if @_page > 1
                prev = @_page - 1

            if @_page + 1 < count_page
                next = @_page + 1


            callback( 
                count : count ,
                count_page : count_page,
                prev : prev ,
                current : @_page ,
                page_size : @_page_size
            )

    ###
        指定取几条数据
    ###
    get : (count = 1, callback) ->
        @_limit      = Number(count)
        @_offset     = 0
        @_query_type = 'SELECT'
        @execute (rows , err) ->
            if err
                return callback false
            if count == 1
                return callback rows[0]
            callback rows


    ###
        取所有合符条件的数据
    ###
    all : (callback) ->
        @_limit      = null
        @_offset     = null
        @_query_type = 'SELECT'
        @execute (rows , err) ->
            if err
                return callback false
            callback rows

    count : (callback) ->
        @_select = ['COUNT(*) AS row_count']
        @_query_type = 'SELECT'
        @.get(1, (row) ->
            if row and row.row_count
                return callback Number(row.row_count)
            callback 0
        )

    ###
        添加数据
    ###
    add : (data) ->
        @_attr = {}
        for k , v of data
            @_attr[k.trim()] = v.toString()

        @_query_type = 'INSERT'
        @

    ###
        保存数据
    ###
    save : (data) ->
        @_attr = {}
        for k , v of data
            @_attr[k.trim()] = v.toString()

        @_query_type = 'UPDATE'
        @

    ###
        删除数据
    ###
    remove : ->
        @_query_type = 'DELETE'
        @

    _get_table_name : ->
        if @_as == null
            return @table_name
        "#{@table_name} AS #{@_as}"

    _get_table_as : ->
        if @_as == null
            return @table_name
        @_as

    _select_to_sql : ->
        if @_select.length == 0
            return '*'
        fields = ( @encode_sql v for v in @_select )
        " #{fields.join ','} "

    _join_to_sql : ->
        if @_joins.length == 0
            return ''

        sql = []
        for v in @_joins
            condition = @encode_sql v.condition
            for a in v.args
                @_args.push a

            sql.push "#{v.type} JOIN #{v.table} ON ( #{condition} )"

        " #{sql.join ' '}"

    _limit_to_sql : ->
        if @_limit == null and @_offset == null
            return ''

        if false == @is_number @_limit
            @_limit = 1

        if @is_number @_offset 
            sql = " LIMIT #{@_offset} , #{@_limit}"
        else
            sql = " LIMIT #{@_limit}"
        sql

    _where_to_sql : ->
        if @_where.length == 0
            return ''

        sql = []
        for v , k in @_where
            condition = @encode_sql v.condition
            for a in v.args
                @_args.push a
            if k > 0
                sql.push "#{v.type} ( #{condition} )"
            else
                sql.push "( #{condition} )"

        " WHERE ( #{sql.join ' '} )"

    field : (field) ->
        if field.indexOf('.') == -1
                return @_get_table_as() + '.' + field
        field


    encode_sql : (condition) ->
        if condition == null
            return condition
        key = @_key 

        condition = condition.replace(new RegExp("\\x28","g")," ( ")
        condition = condition.replace(new RegExp("\\x29","g")," ) ")
        condition = condition.replace(new RegExp("\\x3F","g")," ? ") 
        condition = condition.replace(new RegExp("\\x2A","g")," * ")
    
        for v in ["!" , "=" , "<" , ">" , ","]
            condition = condition.replace(new RegExp(v,"g")," #{v} ") 

        condition = condition.replace(new RegExp("@.","g"), 
                    @_get_table_as() + '.')

        condition_arr = []
        for v in condition.split(' ')
            v = v.trim()
            if v != ''
                if v.toUpperCase() in key
                    condition_arr.push v.toUpperCase()
                else
                    condition_arr.push @encode v

        str = condition_arr.join(' ')
        key = ["!=" , "<=" , ">=" , "<>"]
        for v , k in ["! =" , "< =" , "> =" , "< >"]
            str = str.replace(new RegExp(v,"g"), key[k])
        
        str = str.replace(new RegExp(" \\x28","g"), "(")
        str

    is_number : (n) ->
        return false == isNaN(parseFloat n) and isFinite n

    is_string : (x) -> !!(x is '' or (x and x.charCodeAt and x.substr)) 

    encode : (name)->
        if @is_number name 
            return Number name
        if name.indexOf('.') != -1
            names = ( "`#{v}`" for v in name.split('.') )
            return names.join '.'
        "`#{name}`"

    to_sql : =>
        sql = ''
        switch @_query_type
            when 'INSERT'
                sql = "INSERT INTO #{@encode_sql @_get_table_name()} "

                fields = []
                values = []
                @_args = []
                for k , v of @_attr
                    fields.push @encode k
                    values.push '?'
                    @_args.push v

                sql = sql + "(#{fields.join ','}) VALUES (#{values.join ','})"

            when 'UPDATE'
                sql = "UPDATE #{@encode_sql @_get_table_name()} SET "

                fields = []
                @_args = []
                for k , v of @_attr
                    fields.push @encode_sql "#{k} = ?"
                    @_args.push v

                sql = sql + "
#{fields.join ' , '}
#{@_where_to_sql()} 
#{@_limit_to_sql()}"


            when 'DELETE'
                sql = "
DELETE FROM #{@encode_sql @_get_table_name()}
#{@_where_to_sql()} 
#{@_limit_to_sql()}
"

            else 
                sql = "
SELECT #{@_select_to_sql()} 
FROM #{@encode_sql @_get_table_name()}
#{@_join_to_sql()}
#{@_where_to_sql()}
#{@_group}
#{@_order}
#{@_limit_to_sql()}
"
               
        sql     

        



exports = module.exports = Query

    
