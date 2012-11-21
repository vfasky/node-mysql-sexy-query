mysql = require('../index').mysql_native


connection = mysql.create_connection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'test'
})

class User extends mysql

    table_name : 'user'
    connection : connection

class Role extends mysql

    table_name : 'role'
    connection : connection




