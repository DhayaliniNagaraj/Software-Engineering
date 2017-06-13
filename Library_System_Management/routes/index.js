var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', ensureAuthenticate, function(req,res){
  res.render('index');
});

function ensureAuthenticate(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect('/users/login');
  }
}
module.exports = router;
