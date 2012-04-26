
/**
 * mysql-native 有中文乱码问题, 放弃
 */


var mysql = require('../mysql');
mysql.createClient({
	user: 'root',
    password: '123456',
    database: 'test' 
});
var db = new mysql.query('degree');

db.where('id = ?' , 1).save({ name : '小学' } , function(row){
	console.log( row );
})

db.add({ name : 'test' } , function(row){
	console.log( row );
})

db.where('id = ?' , 7).delete(function(ret){
	console.log( ret ) ;
});

db.count(function(ret){
	console.log( ret ) ;
});

db.page(1 , 2).query(function(ret , pageInfo){
	console.log( ret ) ;
	console.log( pageInfo ) ;
});