var express = require('express');
var router = express.Router();
var User = require('../models/newUser');
var Book = require('../models/newBook');
var Order = require('../models/newOrder');
global._ = require('underscore');

/* Get Register Page */
router.get('/register', function(req, res) {
    res.render('register');
});

/* Get Login Page */
router.get('/login', function(req, res) {
    res.render('login');
});

/* Get HomePage */
router.get('/homePage',function(req,res){
    if(req.session && req.session.user){
        User.getUserByUsername(req.session.user.username,function(err,user){
            if(!user){
                req.flash('error','Session not set');
                req.session.reset();
                res.redirect('/users/login');
            }else{
                res.locals.user = user;
                if(user.usertype=="Admin"){
                    res.locals.admin = "Admin";
                }else if(user.usertype=="Teacher"){
                    res.locals.teacher = "Teacher";
                }else{
                    res.locals.student = "Student";
                }
                res.redirect('/users/availableBooks');
            }
        })
    } else{
        res.redirect('/users/login');
    }
});

/* Register User */
router.post('/register', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var usertype = req.body.usertype;
    var username = req.body.username;
    var password = req.body.password;
    var confirmpassword = req.body.confirmpassword;

    //Validate the form
    req.checkBody('name','Name is Required').notEmpty();
    req.checkBody('email','Email is Required').notEmpty();
    req.checkBody('email','Email is not Valid').isEmail();
    req.checkBody('usertype','User Type is Required').notEmpty();
    req.checkBody('username','Username is Required').notEmpty();
    req.checkBody('password','Password is Required').notEmpty();
    req.checkBody('confirmpassword','Passwords do not match').equals(password);


    var formErrors = req.validationErrors();
    if(formErrors){
        res.render('register',{
           errors : formErrors
        });
    }
    else{
        var newUser = new User({
            name: name,
            email:email,
            usertype:usertype,
            username : username,
            password:password
        });

        User.createUser(newUser,function(err,User){
            if(err) throw err;
            console.log(User);
        });

        req.flash('success_msg','Registered Successfully');
        res.redirect('/users/login');
    }
});

/** Login Function **/
router.get('/logout', function(req, res){
    req.logout();
    req.session.reset();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

/** Login Post **/
router.post('/login',function(req,res,next) {
    User.getUserByUsername(req.body.username, function (err, user) {
        if (!user) {
            req.flash('error', 'Username does not exist');
            res.redirect('/users/login');
        }
        else if (req.body.password == user.password) {
            req.session.user = user;
            res.redirect('/users/homePage');
        }
        else{
            req.flash('error', 'Username and password are incorrect');
            res.redirect('/users/login');
        }
    });
});

/** Get Add Book Page **/
router.get('/addBook', function(req, res) {
    if(req.session && req.session.user){
        var user = req.session.user;
        res.locals.user=user;
        if(user.usertype=="Admin"){
            res.locals.admin = "Admin";
        }else if(user.usertype=="Teacher"){
            res.locals.teacher = "Teacher";
        }else{
            res.locals.student = "Student";
        }
        res.render('addBook');
    }else{
        res.redirect('/users/login');
    }
});

/** Add Book To Repository **/
router.post('/addBooktoRepo', function(req, res) {
    var id = req.body.id;
    var title = req.body.title;
    var author = req.body.author;
    var classes = req.body.class;


    //Validate the form
    req.checkBody('id','id is Required').notEmpty();
    req.checkBody('title','title is Required').notEmpty();
    req.checkBody('author','author is not Valid').notEmpty();
    req.checkBody('class','class is Required').notEmpty();



    var formErrors = req.validationErrors();
    if(formErrors){
        res.render('addBook',{
            errors : formErrors
        });
    }
    else{
        var newBook = new Book({
            Bookid: id,
            Title: title,
            Author : author,
            Class: classes
        });

        Book.addBook(newBook,function(err,Book){
            if(err) throw err;
            console.log(Book);
        });

        req.flash('success_msg','Book added Successfully');
        res.redirect('/users/availableBooks');
    }
});

/** Get All available Books **/
router.get('/availableBooks', function(req, res) {
    var year;
    if(req.session && req.session.user){
        var user = req.session.user;
        res.locals.user=req.session.user;
        if(user.usertype=="Admin"){
            res.locals.admin = "Admin";
        }else if(user.usertype=="Teacher"){
            res.locals.teacher = "Teacher";
        }else{
            res.locals.student = "Student";
            if(user.usertype=="Student - Year1"){
                year = 1;
            }
            else if(user.usertype=="Student - Year2"){
                year = 2;
            }
            else if(user.usertype=="Student - Year3"){
                year = 3;
            }
            else if(user.usertype=="Student - Year4"){
                year = 4;
            }


            Book.findBooksbyYear(year, function(err, book) {
                if(err){
                    res.send('something went wrong');
                    next();
                }
                var book = book;
                Order.getOrderbyUsername(user.username,function(err,order){
                    var bookIds = [];
                    for(var i=0;i<order.length;i++){
                        bookIds.push(order[i].bookid);
                    }
                var books = [];
                for (var i=0;i<book.length;i++){
                    for(var j=0;j<bookIds.length;j++){
                        if(book[i].Bookid==bookIds[j]){
                            var present = true;
                            break;
                        }
                        present=false;
                    }
                    if(!present){
                        books.push(book[i]);
                    }
                }
                res.render('displayBooks',{book:books});
            });
            });
        }
        if(user.usertype=="Teacher" || user.usertype=="Admin"){
            Book.find({}, function(err, book) {
                if(err){
                    res.send('something went wrong');
                    next();
                }
                res.render('displayBooks',{book:book});
            });
        }
    }
});

/** Get Request Book Page **/
router.get('/requestBook', function(req, res) {
    if(req.session && req.session.user){
        var user = req.session.user;
        res.locals.user=req.session.user;
        if(user.usertype=="Admin"){
            res.locals.admin = "Admin";
        }else if(user.usertype=="Teacher"){
            res.locals.teacher = "Teacher";
        }else{
            res.locals.student = "Student";
        }
        var bookid=req.query.id;
        var username=req.session.user.username;
        var Title=req.query.Title;
        var newOrder= new Order({
            bookid: bookid,
            title:Title,
            RequestDate:new Date,
            username : username,
            Status:"Pending",

        });

        Order.getNumberOfOrdersPlaced(req.session.user.username,function(err,count){
           if(err) throw err;
           var ordersLength = count.length;
           if(ordersLength<=6){
               Order.createOrder(newOrder,function(err,Order){
                   if(err) throw err;
               });
               res.redirect('/users/alluserOrders');
           }else{
               req.flash('error','Exceeded the Limit ');
               res.redirect('/users/availableBooks');
           }
        });
    }
});

router.get('/returnBooks',function(req,res){
    if(req.session && req.session.user) {
        var user = req.session.user;
        res.locals.user = req.session.user;
        if (user.usertype == "Admin") {
            res.locals.admin = "Admin";
        } else if (user.usertype == "Teacher") {
            res.locals.teacher = "Teacher";
        } else {
            res.locals.student = "Student";
        }
        var currentDate = new Date;
        Order.returnBook(req.query.id,currentDate,function(err,order){
            res.redirect('/users/alluserOrders');
        })
    }
});

/** Get orders placed by individual user**/
router.get('/alluserOrders', function(req, res) {
    if(req.session && req.session.user) {
        var user = req.session.user;
        res.locals.user=req.session.user;
        if(user.usertype=="Admin"){
            res.locals.admin = "Admin";
        }else if(user.usertype=="Teacher"){
            res.locals.teacher = "Teacher";
        }else{
            res.locals.student = "Student";
        }
        Order.getOrderbyUsername(req.session.user.username, function (err, order) {
            res.render('displayOrders', {order: order, stu: "yes"});
        });
    }
});

/** Get orders to be approved**/
router.get('/processRequest', function(req, res) {
    if(req.session && req.session.user) {
        var user = req.session.user;
        res.locals.user=req.session.user;
        if(user.usertype=="Admin"){
            res.locals.admin = "Admin";
            Order.getOrderbyStatus("Pending", function (err, order) {
                res.render('displayOrders', {order: order, process: "yes"});
            });
        }else if(user.usertype=="Teacher"){
            res.locals.teacher = "Teacher";
            Order.getOrderbyStatusforTeacher("Pending",user.username,function(err,order){
                res.render('displayOrders',{order:order,process: "yes"});
            });
        }else{
            res.locals.student = "Student";
            Order.getOrderbyStatus("Pending", function (err, order) {
                res.render('displayOrders', {order: order, process: "yes"});
            });
        }
    }
});

/** Get Teacher's orders**/
router.get('/teacherOrders', function(req, res) {
    if(req.session && req.session.user) {
        var user = req.session.user;
        res.locals.user=req.session.user;
        if(user.usertype=="Admin"){
            res.locals.admin = "Admin";
        }else if(user.usertype=="Teacher"){
            res.locals.teacher = "Teacher";
        }else{
            res.locals.student = "Student";
        }
        Order.getOrderbyUsername(req.session.user.username, function (err, order) {
            res.render('displayOrders', {order: order, stu: "yes"});
        });
    }
});

/** Get All orders**/
router.get('/allOrders', function(req, res) {
    if(req.session && req.session.user) {
        var user = req.session.user;
        res.locals.user=req.session.user;
        if(user.usertype=="Admin"){
            res.locals.admin = "Admin";
        }else if(user.usertype=="Teacher"){
            res.locals.teacher = "Teacher";
        }else{
            res.locals.student = "Student";
        }
        Order.getOrderbyStatus("Approved", function (err, order) {
            res.render('displayOrders', {order: order, approved: "yes"});
        });
    }
});

/** Approve Book Requests **/
router.get('/approveRequests',function(req,res){
    if(req.session && req.session.user) {
        var user = req.session.user;
        res.locals.user=req.session.user;
        if(user.usertype=="Admin"){
            res.locals.admin = "Admin";
        }else if(user.usertype=="Teacher"){
            res.locals.teacher = "Teacher";
        }else{
            res.locals.student = "Student";
        }
        Date.prototype.addDays = function(days) {
            var dat = new Date(this.valueOf());
            dat.setDate(dat.getDate() + days);
            return dat;
        }
        var currentDate = new Date();
        Order.approveOrder(req.query.id,currentDate,currentDate.addDays(12),function (err, order) {
            res.redirect('/users/processRequest');
            //res.render('displayOrders', {approved: "yes"});
        });
    }
})

/** Logout Function **/
router.get('/logout', function(req, res){
    req.logout();
    req.session.reset();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;
