const db = require( '../database/models' );
const User =  db['user'];

exports.getUserIdBySpaceIdBySpaceId = async ( id, model ) => {
    let result
    await model.findOne({ where: {id: id}})
    .then(async data => {  
        result = data.userId;
     })
    .catch(err => console.log(err)) 
    return result;
};


exports.userInfo = async ( userId ) => {
    let result
    await User.findOne({ where: {id: userId}})
    .then(async data => {  
        result = data;
     })
    .catch(err => console.log(err)) 
    return result;
};