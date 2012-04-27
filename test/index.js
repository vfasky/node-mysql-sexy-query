
/**
 * mysql-native 有中文乱码问题, 放弃
 */
var mysql = require('mysql-libmysqlclient');
var conn = mysql.createConnectionSync();
conn.connectSync('127.0.0.1', 'root', '123456', '0750hs.net');

conn.query("SELECT * FROM degree;", function (err, res) {
  if (err) {
    throw err;
  }
  
  res.fetchAll(function (err, rows) {
    if (err) {
      throw err;
    }
    console.log( rows );
 
    // This isn't necessary since v1.2.0
    // See https://github.com/Sannis/node-mysql-libmysqlclient/issues#issue/60
    //res.freeSync();
  });
});

// var mysql = require('../mysql-native');
// mysql.createClient({
// 	user: 'root',
//     password: '123456',
//     database: '0750hs.net' 
// });
// var db = new mysql.query('degree');
// db.get(function(row){
// 	console.log( row );
// })

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