Query = require '../index.js'

class User extends Query
    
    table_name : 'user'

class Sex extends Query
    
    table_name : 'sex'
    

# user = User.find('user = ?' ,1).as('u');

# user.or('sex = 0')
# user.join(Sex.as('s') , "@.sex_id = s.id")
# user.select('r.name as role , @.id')
# user.group('r.id')
# user.limit(5,5)

# user = User.add 
#     name : 'test' ,
#     sex : 1 

# user = User.find('id = ?' , 1).save(
#     name : 'test' ,
#     sex : 0
# )
 
user = User.find('id = ?' , 1).remove()


console.log user.to_sql()
console.log user._args