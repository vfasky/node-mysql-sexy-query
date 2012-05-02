


var mysql = require('../mysql-native');
mysql.createClient({
	user: 'root',
    password: '123456',
    database: '0750hs.net' 
});
var db = new mysql.query('degree').get(5 , function(row){
	console.log( row );
})

// db.where('id = ?' , 1).save({ name : '小学' } , function(row){
// 	console.log( row );
// })

// db.add({ name : 'test' } , function(row){
// 	console.log( row );
// })

// db.where('id = ?' , 7).delete(function(ret){
// 	console.log( ret ) ;
// });

// db.count(function(ret){
// 	console.log( ret ) ;
// });

// db.page(1 , 2).query(function(ret , pageInfo){
// 	console.log( ret ) ;
// 	console.log( pageInfo ) ;
// });