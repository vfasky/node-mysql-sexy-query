友好的sql查询
-------------

mysql-sex-query 有几个特点：

   1. 支持查询队列( 基于 mysql-queues )
   2. 支持链操作构造sql语句
   3. 对查询结果支持绑定

使用方法
    
    //连接数据库
    var mysql = require('mysql-sex-query');
    mysql.createClient({
        user: 'root',
        password: '123456',
        database: 'test'
    });

    //构造sql语句
    //return SELECT `id`,`name`,`sex` FROM `user` WHERE (( `sex`  =  0 )  OR ( `id`  >  1 ))  LIMIT 10 , 10
    var sql = mysql.use('user').where('sex = ?' , 0)
                               .orWhere('id > ?' , 1)
                               .select('id , name , sex')
                               .page(2 , 10)
                               .sql();

    //查询 1 条数据
    mysql.use('user').where('sex = ?' , 0)
                     .select('id , name , sex')
                     .order('id DESC')
                     .get( function(row){
                        console.log(row)
                     });

    //查询 10 条数据
    mysql.use('user').where('sex = ?' , 0)
                     .select('id , name , sex')
                     .order('id DESC')
                     .get( 10 , function(rows){
                        console.log(rows)
                     });

    //统计
    mysql.use('user').where('sex = ?' , 0).count(function(count){
        console.log(count);
    });

    //分页查询
    mysql.use('user').where('sex = ?' , 0)
                     .orWhere('id > ?' , 1)
                     .select('id , name , sex')
                     .page(2 , 10)
                     .query(function(rows , pageInfo){
                        console.log(rows);
                        
                        /**
                         * pageInfo 
                         * - count : 数据总数 ,
                         * - countPage : 总页数 ,
                         * - prev : 上一页的页码 ,
                         * - current : 当前页码 ,
                         * - next : 下一页的页码 ,
                         * - pageSize : 每页的数据条数 
                         */
                        console.log(pageInfo);
                     });

    //关联查询
    mysql.use('user AS U').join('role_has_user AS RU ON U.id = RU.user_id')
                          .join('role AS R ON R.id = RU.role_id')
                          .select('U.id , U.name , R.name AS role')
                          .where('U.id = ?' , 1)
                          .get(function(row){
                            console.log(row);
                          });

    //查询结果绑定
    var meta = function(attr){
        for( k in attr )
        {
            this[ k ] = attr[k];
        }
        this.sexStr = function(){
            return this.sex == 1 ? '男' : '女';
        };
    };
    var ar = new mysql.query('user');
    ar.meta = meta;
    ar.get(function(row){
        console.log( row.sexStr() );
    });

    var ar = new mysql.query('user');
    ar.meta = meta;
    ar.get( 10 , function(rows){
        console.log( rows );
    });

    //添加数据
    mysql.use('user').add({
        'name' : 'test' ,
        'sex' : 1 ,
        'role_id' : 1 
    }, function(id){
        if( false == id ) console.log( '添加失败' );
        console.log( id );
    });

    //编辑数据
    mysql.use('user').where('id = ?' , 1)
                     .save({
                        name : 'test2'
                      } , function(affectedRows){
                        if( affectedRows == 0 ) console.log( '没以数据被更改' );
                        console.log( '更改成功' );
                     });

    //删除数据
    mysql.use('user').where('id = ?' , 1)
                     .delete(function(affectedRows){
                        if( affectedRows == 0 ) console.log( '没以数据被删除' );
                        console.log( '删除成功' );
                     })l


    //提交查询
    mysql.execute();

    

    

