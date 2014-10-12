var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var Linkedin = require('node-linkedin')('75rr9d5pcxbxe7', 't7lladYvHYHlbgHh', 'http://54.215.193.137:3000/oauth/linkedin/callback');
var linkedin = Linkedin.init('my_access_token', {
    timeout: 10000 /* 10 seconds */
});
//mongoose.connect('mongodb://localhost/spartanfly');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: '11'});
});

router.get('/plan', function(req, res) {
  res.render('business-plan');
});

// router.get('/login', function(req, res) {
  
//   if(req.session.user == undefined){
//   	req.session.user = {username: "fengjiawei"};
//   	res.render('index', { title: '11', user: req.session.user});
//   }else{
//   	res.send("hi i am "+JSON.stringify(req.session.user));
//   }
// });



router.get('/oauth/linkedin', function(req, res) {
    // This will ask for permisssions etc and redirect to callback url.
    Linkedin.auth.authorize(res, ['r_basicprofile', 'r_fullprofile', 'r_emailaddress', 'r_network', 'r_contactinfo', 'rw_nus', 'rw_groups', 'w_messages']);
});

router.get('/oauth/linkedin/callback', function(req, res) {
    Linkedin.auth.getAccessToken(res, req.query.code, function(err, results) {
        if ( err )
            return console.error(err);

        /**
         * Results have something like:
         * {"expires_in":5184000,"access_token":". . . ."}
         */
        console.log("+"+results);
        res.send(results);
        //return res.redirect('/');
    });
});

module.exports = router;
