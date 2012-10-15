Query = require '../query'

###
mysql-native 适配合器
@link https://github.com/sidorares/nodejs-mysql-native
@install npm install mysql-native
###

class mysql_native extends Query

    connection : false

    @create_connection : (cfg  = {
        host     : '127.0.0.1', 
        user     : 'root' , 
        password : '' ,
        database : 'test' ,
        port     : 3306 ,
        client   : 'TCP'
    }) ->
        if cfg.client == 'UNIX' 
            db = require('mysql-native').createUNIXClient( cfg.path )
        else
            db = require('mysql-native').createTCPClient( cfg.host , cfg.port )
        db.set('auto_prepare' , true)
        db.set('charset' , 'utf8_general_cs')
        db.auth(cfg.database , cfg.user, cfg.password)
        db

    # 适配器
    adapter : (sql, args, callback) ->
        if @connection
            db = @connection.execute(sql, args)
            if @_query_type != 'SELECT'
                db.on('end', -> 
                    callback(@result)
                )
            else
                db.on('row', (r) ->
                
                    if r.length == undefined
                        return callback [r]
                    if r == false
                        return callback []
                    callback r
                )
                                          
            db.on('error', (e) ->
              callback(false , e.message)
            )

exports = module.exports = mysql_native  