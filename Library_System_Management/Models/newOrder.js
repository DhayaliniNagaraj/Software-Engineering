/**
 * Created on 4/21/2017.
 */

var mongoose = require('mongoose');
var orderSchema = mongoose.Schema({
    username : {
        type : String
    },
    bookid : {
        type : Number
    },
    title: {
        type : String
    },
    RequestDate:{
        type : Date
    },
    Status:{
        type: String
    },
    ApprovalDate:{
        type : Date
    },
    DueDate:{
        type : Date
    }
});


var Order = module.exports = mongoose.model('Order',orderSchema);

module.exports.createOrder = function (newOrder,callback) {
    newOrder.save(callback);
}

module.exports.getOrderbyUsername = function(username,callback){
    var query = {username : username,Status : {$ne:"Returned"}};
    Order.find(query,callback);
}

module.exports.getOrderbyStatusforTeacher = function(status,username,callback){
    var query = {username: {$ne:username},Status:status};
    Order.find(query,callback);
}


module.exports.getOrderbyStatus = function(status,callback){
    var query = {Status : status};
    Order.find(query,callback);
}

module.exports.approveOrder = function(id,currentDate,dueDate,callback){
    Order.findByIdAndUpdate(id,{ $set: { Status: 'Approved',ApprovalDate:currentDate,DueDate:dueDate }},callback);
}

module.exports.getNumberOfOrdersPlaced = function(username,callback){
    var query = {username:username,Status : {$ne:"Returned"}  };
    Order.find(query,callback);
}


module.exports.returnBook = function(id,currentDate,callback){
    Order.findByIdAndUpdate(id,{ $set: { Status: 'Returned',ReturnedDate:currentDate }},callback);
}




