mysql-sexy-query
====================
>  一个优雅的 sql 构造器 


### 新版特性 ：

 * 用 CoffeeScript 重构代码
 * 降偶，使用`适配器`的方式与驱动连接
   * 支持 [node-mysql](https://github.com/felixge/node-mysql)
   * 支持 [mysql-native](https://github.com/sidorares/nodejs-mysql-native)
   
   
### DEMO ：
``` CoffeeScript

# 使用 node-mysql 适合器
mysql = require('node-mysql-sexy-query').mysql
    
connection = mysql.create_connection(
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'test'
)

class User extends mysql
    table_name : 'user'
    connection : connection

class Role extends mysql
    table_name : 'role'
    connection : connection
    
```