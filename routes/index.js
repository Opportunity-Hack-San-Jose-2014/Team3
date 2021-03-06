var http = require("https");
var express = require('express');
var router = express.Router();
var async = require('async')
var Linkedin = require('node-linkedin')('75rr9d5pcxbxe7', 't7lladYvHYHlbgHh', 'http://founderbutterfly.com/oauth/linkedin/callback');

var linkedin = Linkedin.init('my_access_token', {
    timeout: 10000 /* 10 seconds */
});

var api = require('./controllers/api.js');

/* GET home page. */

router.get('/', function (req, res) {
    res.render('index', { title: '11'});
});

router.get('/dashboard/:id', function (req, res) {
    //res.render('dashboard');

    req.session.userType = "mentee";
    // console.log("1111"+req.session.user.userId);
//    api.findMentee(req.session.user.userId,function(err, mentee){
//        res.render('mentor', {mentee : mentee});
//    });

    api.getMentee(req.params.id, function(err, user){
        if(err)
            console.log(err);
        // res.send(user);
        res.render('dashboard', {user:user._doc});
    });
});

router.get('/plan-mentor/:id', function (req, res) {
    //var ids=["zFQRactjFi","IyT2spp3n9"];
    var skills = [
        ["legal", "law", "laywer", "international"],
        ["bank","banking", "invest", "investment", "money","FINANCIAL", "FINANCe"],
        ["adv", "advertising", "advertisement","management","strategy","logistic"],
        ["php", "java", "Hadoop", "python", "ios","ruby"]
    ];
    //            res.render('plan-mentor', {mentors: [{name: 'Lan Xu', industry: 'it', skills: ['Java','PHP'] }, {name: 'Json Yi', industry: 'it', skills: ['Java','PHP'] },{name: 'Frank Feng', industry: 'it', skills: ['Java','PHP'] }]} );


    async.map(skills, function (skill, callback) {
        getMentors(req, skill, function (json) {
            callback(null,json);
        })
    }, function (err,jsons) {
        res.render('plan-mentor', {userId: req.params.id ,mentors: jsons});
    });
    //;
});

router.get('/plan', function (req, res) {
    req.session.userType = "mentee";
    console.log("userid: " + req.session.userId);
    api.getMentee(req.session.userId, function(err, user){
        if(err)
            console.log(err);
       // res.send(user);
        res.render('business-plan', {user:user});
    });
});

router.post('/plan', function (req, res) {
    req.session.userType = "mentee";
    console.log("userid: " + req.session.userId);

    if(req.session.userId == null || req.session.userId == undefined) {
        res.send('-1');
        return;
    }

    var jsondata = {
        planName: req.body.name,
        category: req.body.category,
        age: req.body.age,
        location: req.body.location,
        creator: req.session.userId,
        description: req.body.description,
        domains: []
    };

    api.addPlan(jsondata, function (err, plan) {
        if (err) console.log(err)
        console.log(plan)
        //res.render("plan-mentor", {planId : plan});
        res.redirect("/plan-mentor/"+ jsondata.creator);
    });
});

router.get('/mentor', function (req, res) {
    req.session.userType = "mentor";
   // console.log("1111"+req.session.user.userId);
//    api.findMentee(req.session.user.userId,function(err, mentee){
//        res.render('mentor', {mentee : mentee});
//    });

    api.getMentor(req.session.userId, function(err, user){
        if(err)
            console.log(err);
        // res.send(user);
        res.render('mentor', {user:user});
    });
});

router.get('/diagram', function (req, res) {
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

        fetchProfile(results.access_token, function (chunk) {
            var linkedinUser = JSON.parse(chunk);
            req.session.userId = linkedinUser.id;

            console.log(req.session.userId);
            isExist(req.session.userType, linkedinUser, function (result) {

                //res.redirect('/');
                if (req.session.userType == "mentee") {
                    res.redirect('/plan');
                }
                else {
                    res.redirect("/mentor");
                }
                //linkedinID will be returned on update and create
                req.session.userId = result;
            });
        });

    });
});

function getMentors(req, skills, callback) {
    api.matchSkills(skills, 20, function (error, mentors) {
        console.log("Mentors number: " + mentors.length);

        async.map(mentors, function (mentor, callback) {
            fetchSharedConnections(mentor._id, req.session.linkdinAccessCode, function (id, str) {
                var sharedConnections = JSON.parse(str);
                console.log("RAW: " + JSON.stringify(sharedConnections));
                if (sharedConnections.status == null && JSON.stringify(sharedConnections.relationToViewer) != "{}") {
                    var numOfConnections = sharedConnections.relationToViewer.connections._total;
                    console.log("Shared: " + numOfConnections);
                    callback(null, [mentor, numOfConnections]);
                }
                else {
                    callback(null, [mentor, 0]);
                }

            })
        }, function (err, results) {
            if (err) console.log(err)
            console.log("All: " + JSON.stringify(results));
            results.sort(api.compareScore).map(function (result) {
                return result[0]
            });

            console.log(results);
            var json = [];

            for (var i = 0; i < results.length; i++) {
                json.push(results[i][0]._doc);
            }
            callback(json);
        })
    });
}
function fetchProfile(code, callback) {
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
    http.request(option, function (res) {
        var str = '';
        res.on('data', function (chunk) {
            str += chunk;
        });
        res.on('end', function () {
            callback(str);
        });
    }).end();
};

function fetchSharedConnections(id, code, callback) {
    var option = {
        host: "api.linkedin.com",
        port: 443,
        path: "/v1/people/" + id + ":(id,first-name,last-name,relation-to-viewer:(connections))",
        method: "get",
        headers: {
            'Authorization': 'Bearer ' + code,
            "x-li-format": "json"
        }
    }
    http.request(option, function (res) {
        var str = '';
        res.on('data', function (chunk) {
            str += chunk;
        });
        res.on('end', function () {
            console.log("sharedConnections retrieved for:" + id);
            callback(id, str);
        });
    }).end();
}

function isExist(userType, linkedinUser, callback) {
    if (userType == "mentor") {
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
