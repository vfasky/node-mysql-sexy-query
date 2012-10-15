Query = require '../query'

###
node-mysql 适配合器
@link https://github.com/felixge/node-mysql
@install npm install mysql@2.0.0-alpha3 
or npm install git://github.com/felixge/node-mysql.git
###

class mysql extends Query

    connection : false

    @create_connection : require('mysql').createConnection

    # 适配器
    adapter : (sql, args, callback) ->
        if @connection
            @connection.query(sql, args, (err , row = false) ->
                callback(row , err)
            )

exports = module.exports = mysql    
