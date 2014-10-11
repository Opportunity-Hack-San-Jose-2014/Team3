var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");

/* GET home page. */
router.get('/', function(req, res) {
  //mongoose.connect('mongodb://localhost/spartanfly');
  res.render('index', { title: 'Express' });
});

module.exports = router;
