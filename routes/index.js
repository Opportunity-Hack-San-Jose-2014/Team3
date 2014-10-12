var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");

/* GET home page. */
router.get('/', function(req, res) {
  //mongoose.connect('mongodb://localhost/spartanfly');
  console.log(JSON.stringify(req.session.user));
  if(req.session.user == undefined){
  	req.session.user = {username: "fengjiawei"};
  	res.render('index', { title: '11', user: req.session.user});
  }else{
  	res.send("hi i am "+JSON.stringify(req.session.user));
  }
});

router.get('/plan', function(req, res) {
  res.render('business-plan');
});


module.exports = router;
