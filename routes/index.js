var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");

/* GET home page. */
router.get('/', function(req, res) {
  //mongoose.connect('mongodb://localhost/spartanfly');
  res.render('index', { title: '11' });
});


router.get('/start', function(req, res) {
  //mongoose.connect('mongodb://localhost/spartanfly');
  res.render('business-plan');
});


module.exports = router;
