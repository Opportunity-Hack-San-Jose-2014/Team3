var http = require("https");
var express = require('express');
var router = express.Router();
var async = require('async')
var Linkedin = require('node-linkedin')('75rr9d5pcxbxe7', 't7lladYvHYHlbgHh', 'http://founderbutterfly.com:3000/oauth/linkedin/callback');

var linkedin = Linkedin.init('my_access_token', {
    timeout: 10000 /* 10 seconds */
});

var api = require('./controllers/api.js');

/* GET home page. */

router.get('/', function (req, res) {
    res.render('index', { title: '11'});
});

router.get('/dashboard', function (req, res) {
    res.render('dashboard');
});

router.get('/plan-mentor', function (req, res) {
    //var ids=["zFQRactjFi","IyT2spp3n9"];
    var skills = ["php","java","python"];
    api.matchSkills(skills,20,function(error,mentors){
        console.log("Mentors number: "+mentors.length);
        
        async.map(mentors, function(id, callback)
        {
            fetchSharedConnections(id,req.session.linkdinAccessCode, function(id,str){
                var sharedConnections = JSON.parse(str);
                console.log("RAW: "+JSON.stringify(sharedConnections));
                if(sharedConnections.status == null && JSON.stringify(sharedConnections.relationToViewer) != "{}")
                {
                    var numOfConnections = sharedConnections.relationToViewer.connections._total;
                    console.log("Shared: "+numOfConnections);
                    console.log("ID: "+id);
                    callback(null, [id, numOfConnections]);
                }
                else
                {
                    callback(null, [id, 0]);
                }

        })}, function(err, results){
            if (err) console.log(err)
            console.log("All: "+JSON.stringify(results));
            results.sort(api.compareScore);
            console.log(results);
            res.render('plan-mentor');

            })
        });
    
});

router.get('/plan', function (req, res) {
    req.session.userType = "mentee";
    console.log("userid: " + req.session.userId);
    res.render('business-plan', {userId: req.session.userId});
});

router.post('/plan', function (req, res) {
    req.session.userType = "mentee";
    console.log("userid: " + req.session.userId);

    if(req.session.userId === null) {
        res.send('-1');
        return;
    }

    var json =
    {
        planName: req.body.name,
        category: req.body.category,
        age: req.body.age,
        location: req.body.location,
        creator: req.session.userId,
        neededSkills: []
    };

    api.addPlan(json, function () {
    });
});

router.get('/mentor', function (req, res) {
    req.session.userType = "mentor";
    res.render('mentor');
});

router.get('/diagram', function(req, res) {
    // req.session.userType = "mentor";
    // api.findMentor(req.session.userId, function());
    res.render('diagram');
});


// router.get('/login', function(req, res) {

//   if(req.session.user == undefined){
//   	req.session.user = {username: "fengjiawei"};
//   	res.render('index', { title: '11', user: req.session.user});
//   }else{
//   	res.send("hi i am "+JSON.stringify(req.session.user));
//   }
// });


router.get('/oauth/linkedin', function (req, res) {
    // This will ask for permisssions etc and redirect to callback url.
    Linkedin.auth.authorize(res, ['r_basicprofile', 'r_fullprofile', 'r_emailaddress', 'r_network', 'r_contactinfo', 'rw_nus', 'rw_groups', 'w_messages']);
});

router.get('/oauth/linkedin/callback', function (req, res) {
    Linkedin.auth.getAccessToken(res, req.query.code, function (err, results) {
        if (err)
            return console.error(err);
        var results = JSON.parse(results);

        req.session.linkdinAccessCode = results.access_token;

        fetchProfile(results.access_token, function(chunk){
            var linkedinUser = JSON.parse(chunk);
            req.session.userId = linkedinUser.id;

            console.log(req.session.userId);
            isExist(req.session.userType, linkedinUser, function (result) {
                //res.redirect('/');
                if (req.session.userType == "mentor") {
                    res.redirect('/mentor');
                }
                else {
                    res.redirect("/plan");
                }
                //linkedinID will be returned on update and create
                req.session.userId = result;
            });
        });

    });
});

function fetchProfile(code,callback){
    var option = {
        host: "api.linkedin.com",
        port: 443,
        path: "/v1/people/~:(id,first-name,headline,last-name,industry,skills,picture-url,public-profile-url)",
        method: "get",
        headers: {
            'Authorization': 'Bearer ' + code,
            "x-li-format": "json"
        }
    }
    http.request(option, function(res){
        var str = '';
        res.on('data', function(chunk){
            str += chunk;
        });
        res.on('end',function(){
            callback(str);
        });
    }).end();
};

function fetchSharedConnections(id,code,callback){
       var option = {
        host:"api.linkedin.com",
        port: 443,
        path: "/v1/people/"+id+":(id,first-name,last-name,relation-to-viewer:(connections))",
        method: "get",
        headers: {
        'Authorization': 'Bearer '+code,
         "x-li-format" : "json"
        }
    }
    http.request(option, function(res){
        var str = '';
        res.on('data', function(chunk){
            str += chunk;
        });
        res.on('end',function(){
            console.log("sharedConnections retrieved for:"+id);
            callback(id,str);
        });
    }).end();
}

function isExist(userType,linkedinUser, callback){
    if(userType=="mentor")
    {
        console.log("find mentor");
        api.findMentor(linkedinUser.id, function (err, result) {
            // user existed, update
            if (result) {
                console.log("Update user: " + linkedinUser.firstName + "id: " + linkedinUser.id);
                api.updateMentor(linkedinUser, function (err, result) {
                    if (err) {
                        console.og("update failed");
                    }
                    else
                        console.log(result);
                    callback(err, result);
                });
            } else {
                // add new user
                console.log("Insert new user: " + linkedinUser.firstName + "id: " + linkedinUser.id);
                api.addMentor(linkedinUser, function (err, result) {
                    if (err) {
                        console.log("add failed");
                    }
                    else
                        console.log(result);
                    callback(err, result);
                });
            }
        });
    }
    else {
        console.log("find mentee");
        api.findMentee(linkedinUser.id, function (err, result) {
            // user existed, update
            if (result) {
                console.log("Update user: " + linkedinUser.firstName + "id: " + linkedinUser.id);
                api.updateMentee(linkedinUser, function (err, result) {
                    if (err) {
                        console.og("update failed");
                    }
                    else
                        console.log(result);
                    callback(err, result);
                });
            } else {
                // add new user
                console.log("Insert new user: " + linkedinUser.firstName + "id: " + linkedinUser.id);
                api.addMentee(linkedinUser, function (err, result) {
                    if (err) {
                        console.log("add failed");
                    }
                    else
                        console.log(result);
                    callback(err, result);
                });
            }
        });
    }
};

module.exports = router;
