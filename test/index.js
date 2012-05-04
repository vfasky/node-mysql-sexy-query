


var mysql = require('../mysql-native');

mysql.createClient({
	user: 'root',
    password: '123456',
    database: '0750hs.net' 
});

var sql = mysql.use('user').where('sex = ?' , 0)
                               .or('id > ?' , 1)
                               .select('id , name , sex')
                               .page(2 , 10)
                               .sql();

                               console.log(sql);

// //查询1条
// mysql.use('degree').get( function(row){
// 	console.log( row );
// });
// //查询5条
// mysql.use('degree').get(5 , function(rows){
// 	console.log( rows );
// });
// //统计
// mysql.use('degree').count(function(count){
// 	console.log( count );
// });
// //分页查询
// mysql.use('degree').page(1 , 2).query(function(rows , pageInfo){
// 	console.log( rows );
// 	console.log( pageInfo );
	
// }); 
// 

// //添加
// mysql.use('degree').save({name : '中文测试'} , function(id ,ret){
// 	console.log( id );
// 	console.log( ret );
// 	
// });

// //编辑
// mysql.use('degree').where('id = ?' , 7 ).save({name : '中文测试'} , function(affectedRows ,ret){
// 	console.log( affectedRows );
// 	console.log( ret );

// });


// //删除
// mysql.use('degree').where('id = ?' , 7 ).or('id = ?' ,8).delete(function(affectedRows){
// 	console.log( affectedRows );
// 	mysql.close();
// });