Query = require '../query'
PoolModule = require 'generic-pool'
Client = require 'mariasql'
###
maria-pool 适配合器
@link 
@install npm install mariasql
###

class maria_pool extends Query

    @connection : false

    @create_connection : (cfg  = {
        host     : '127.0.0.1', 
        user     : 'root' , 
        password : '' ,
        database : 'test' ,
        port     : 3306 ,
        log      : true,
        maxPool  : 100,
        minPool  : 10
    }) ->

        connection = PoolModule.Pool({
        name:'maria',
        create:(callback) ->
            c =new Client()
            c.connect({
                host: cfg.host,
                user: cfg.user,
                password: cfg.password,
                port:cfg.port,
                db:cfg.database

            });
            c.on('connect', () ->
                    console.log 'Client connected'
                    callback(null,c)
                )
            .on('error', (err) ->
                    console.log 'Client error: ' + err
                    callback(err,null)
                )
            .on('close', (hadError) -> 
                console.log 'Client closed'
                );
        ,
        destroy: (client) ->
                    client.end() 
        max:cfg.maxPool,
        min:cfg.minPool,   
        idleTimeoutMillis:30000,
        log : cfg.log 
        })
      
     


    # 适配器
    adapter : (sql, args, callback) ->
        if (@connection)
            c=@connection
            @connection.acquire (err, client) ->
                if (err) 
                    callback err,null  
                else
                    result=[]
                    db=client.query sql, args
                    db.on('result', (res) -> 
                        res.on('row', (row) ->
                            console.log 'Result row: ' + row
                            result.push row
                        )
                        .on('error', (err) ->
                            console.log 'Result error: ' + err
                        )
                        .on('end', (info) ->
                            console.log 'Result finished successfully'
                            callback(null,result);
                        )
                    )
                    db.on('end', () ->
                        console.log 'Done with all results'
                        c.release client
                    );
              
exports = module.exports = maria_pool  
