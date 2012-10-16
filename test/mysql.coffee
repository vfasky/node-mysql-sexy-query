###
  测试 mysql 适配器
###
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
    
# return console.log User.find('id = ?' , 1).as('U')
#     .join(Role.as('R') , '@.role_id = R.id')
#     .select('@.id , @.name , R.name as role_name')
#     .to_sql()

# return console.log Role.add(
#     name : 'admin'
# ).to_sql()

# Role.add(
#     name : 'admin'
# ).execute (rows , err) -> 
#     console.log err
#     console.log rows
# return

# User.add(
#     name : 'test' ,
#     sex : 1 ,
#     email : 'vfasky@test.com' ,
#     role_id : 1
# ).execute (rows) -> 
#     console.log rows

Wind = require 'wind'


user = User.find('id = ?' , 28)

eval(Wind.compile("async", ->
  data = $await(user.execute_async())
  console.log data
))


 # console.log data

# for i in [1,2,3,4,5,6,7,8,9,10,11,12,13]
#     User.add(
#         name : 'test' + i.toString()
#         sex : 2 ,
#         email : "vfasky#{i}@test.com"
#     ).execute()

# User.find('id = ?' , 1).save(
#     sex : 2
# ).execute (err, rows) ->
#     console.log err
#     console.log rows
     
# console.log User.find('id = ?' , 1).count().to_sql()

# User.find('id = ?' , 1).count().execute (err, rows) ->
#     console.log err
#     console.log rows    

# console.log User.find('id = ?', 1).get().to_sql()
# User.find('id = ?', 1).get().execute (err, rows) ->
#     console.log err
#     console.log rows    

# User.find().page(2,5).execute (rows) ->

#     console.log rows

# user = new User
# console.log user.constructor.self

