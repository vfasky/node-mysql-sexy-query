mysql = require('../index').mysql_native
Wind  = require 'wind'

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


user = User.find('id != ?' , 1)

ret = eval(Wind.compile("async", ->
  $await user.execute_async()
))

console.log ret

