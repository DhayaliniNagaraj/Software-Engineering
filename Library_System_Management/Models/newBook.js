/**
 * Created on 4/21/2017.
 */

var mongoose = require('mongoose');
var bookSchema = mongoose.Schema({
    Bookid : {
        type : Number,
        index : true
    },
    Title : {
        type : String,
        index : true
    },
    Author : {
        type : String
    },
    Class:{
        type : Number
    }
});


var Book = module.exports = mongoose.model('Book',bookSchema);

module.exports.addBook = function (newBook,callback) {
    newBook.save(callback);
}

module.exports.getBookByTitle = function(Title,callback){
    var query = {Title : Title};
    Book.findOne(query,callback);
}

module.exports.findBooksbyYear = function(year,callback){
    var query = {Class: year};
    Book.find(query,callback);
}

