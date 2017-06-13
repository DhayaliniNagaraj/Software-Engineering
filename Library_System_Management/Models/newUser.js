/**
 * Created on 4/21/2017.
 */

var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
    username : {
        type : String,
        index : true
    },
    password : {
        type : String
    },
    usertype : {
        type : String
    },
    email : {
        type : String
    },
    name:{
        type : String
    }
});


var User = module.exports = mongoose.model('User',userSchema);

module.exports.createUser = function (newUser,callback) {
    newUser.save(callback);
}

module.exports.getUserByUsername = function(username,callback){
    var query = {username : username};
    User.findOne(query,callback);
}


