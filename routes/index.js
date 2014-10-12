var http = require("https");
var express = require('express');
var router = express.Router();

var Linkedin = require('node-linkedin')('75rr9d5pcxbxe7', 't7lladYvHYHlbgHh', 'http://www.founderbutterfly.com:3000/oauth/linkedin/callback');

var linkedin = Linkedin.init('my_access_token', {
    timeout: 10000 /* 10 seconds */
});

var api = require('./controllers/api.js');

/* GET home page. */

router.get('/', function(req, res) {
  res.render('index', { title: '11'});
});

router.get('/dashboard', function (req, res) {
    res.render('dashboard');
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
        var results = JSON.parse(results);
         //console.log("3"+results.access_token);

        req.session.linkdinAccessCode = results.access_token;
        //fetch(results.access_token);
        fetch(results.access_token, function(chunk){

        	res.send(JSON.stringify(JSON.parse(chunk)));
        });
        //res.redirect('/');
    });
});

function fetch(code,callback){
	
	var option = {
		host:"api.linkedin.com",
		port: 443,
		path: "/v1/people/~:(id,first-name,headline,last-name,industry,skills)",
		method: "get",
		headers: {
        'Authorization': 'Bearer '+code,
         "x-li-format" : "json"
    	}
	}
	http.request(option, function(res){
		res.on('data', function(chunk){
			callback(chunk);
		});
	}).end();
};

// function isExist(uid, callback){
// 	if(uid){
// 		update(get(uid))
// 	}else{
// 		insert(uid);
// 	}
// 	callback();
// };

module.exports = router;
