/**
 * Created by lan on 10/11/14.
 */
var Mentor = require('../../models/mentor.js');
var Mentee = require('../../models/mentee.js');
var Plan = require('../../models/plan.js');
var Template = require('../../models/template.js');
var async = require('async');

exports.findMentee = function(id, callback){
    Mentee.findById(id, function(err, mentee){
        if (err) callback(err);
        else callback(null, mentee != null);
    });
}

exports.findMentor = function(id, callback){
    Mentor.findById(id, function(err, mentor){
        if (err) callback(err);
        else callback(null, mentor != null);
    });
}

exports.addMentor = function(jsondata, callback){
    var skills = []
    for(var i = 0; i < jsondata.skills.values.length; i++){
        skills.push(jsondata.skills.values[i].skill.name)
    }
    new Mentor({
        _id: jsondata.id,
        url: jsondata.publicProfileUrl,
        picURL: jsondata.pictureUrl,
        firstName: jsondata.firstName,
        lastName: jsondata.lastName,
        headline: jsondata.headline,
        industry: jsondata.industry,
        skills: skills
    }).save(function(err, mentor){
            if (err) callback(err);
            else callback(null, mentor._id);
        });
}

exports.addMentee = function(jsondata, callback){
    new Mentee({
        _id: jsondata.id,
        url: jsondata.publicProfileUrl,
        picURL: jsondata.pictureUrl,
        firstName: jsondata.firstName,
        lastName: jsondata.lastName,
        headline: jsondata.headline,
        industry: jsondata.industry
    }).save(function(err, mentee){
            if (err) callback(err);
            else callback(null, mentee._id);
        });
}

exports.addPlan = function(jsondata, callback){
    new Plan({
        planName: jsondata.planName,
        category: jsondata.category,
        age: jsondata.age,
        location: jsondata.location,
        creator: jsondata.creator,
        description: jsondata.description,
        domains: jsondata.domains
    }).save(function(err, plan){
            if (err) callback(err);

            async.parallel([
                function(cb){
                    // update mentee plans
                    Mentee.findById(jsondata.creator, function(err, mentee){
                        mentee.update({$push: {plans: plan.id}}, function(err){
                            if (err) cb(err);
                            else cb(null);
                        })
                    });
                },
                function(cb){
                    // update mentor plan invited
                    async.each(jsondata.domains, function(dom, innercb){
                        Mentor.findById(dom.mentor, function(err, mentor){
                            mentor.update({$push: {planInvitations: plan.id}}, function(err){
                                if (err) innercb(err);
                                innercb(null);
                            })
                        })
                    }, function(err){
                        if (err) cb(err);
                        else cb(null)
                    });
                }
            ], function(err){
                if (err) callback(err);
                else callback(null, plan._id);
            })
        });
}


exports.addDomain = function(jsondata, callback){
    new Template({
        _id: jsondata.business,
        domains: jsondata.domains
    }).save(function(err){
            if (err) callback(err);
            else callback(null, "Domain saved");
        });
}


exports.updateMentor = function(jsondata, callback){
    Mentor.findById(jsondata.id, function(err, item){
        if (err) callback(err)

        var skills = []
        for(var i = 0; i < jsondata.skills.values.length; i++){
            skills.push(jsondata.skills.values[i].skill.name)
        }
        item.update({$set: {
            url: jsondata.publicProfileUrl,
            picURL: jsondata.pictureUrl,
            firstName: jsondata.firstName,
            lastName: jsondata.lastName,
            headline: jsondata.headline,
            industry: jsondata.industry,
            skills: skills
        }}, function(err){
            if (err) callback(err);
            else callback(null, item._id);
        })
    });
}


exports.updateMentee = function(jsondata, callback){
    Mentee.findById(jsondata.id, function(err, item){
        if (err) callback(err)

        item.update({$set: {
            url: jsondata.publicProfileUrl,
            picURL: jsondata.pictureUrl,
            firstName: jsondata.firstName,
            lastName: jsondata.lastName,
            headline: jsondata.headline,
            industry: jsondata.industry
        }}, function(err){
            if (err) callback(err);
            else callback(null, item._id);
        })
    });
}

// {plan: id, mentor: id, confirmed: Accepted/Rejected}
exports.confirmPlan = function(jsondata, callback){
    Plan.update({
        _id : jsondata.plan,
        "domains.mentor": jsondata.mentor
    }, {
        $set: {
            "domains.$.confirmed": jsondata.confirmed,
            "domains.$.confirmDate": Date.now()
        }
    }, function(err){
            if (err) callback(err);
            else callback(null, "Plan confirmation updated");
    })
}

// {plan: id, dom: dom, mentor: id}
exports.addPlanMentor = function(jsondata, callback) {
    Plan.findById(jsondata.plan, function (err, item) {
        item.update({$push: {
            domains: {
                dom: jsondata.dom,
                mentor: jsondata.mentor
            }
        }}, function (err) {
            if (err) callback(err);

            // update mentor plan invited
            Mentor.findById(jsondata.mentor, function (err, mentor) {
                mentor.update({$push: {planInvitations: jsondata.plan}}, function (err) {
                    if (err) callback(err);
                    callback(null, jsondata.plan);
                });
            });
        })
    })
}


exports.getMentor = function(id, callback){
    Mentor.findById(id, function(err, item){
        if(err) callback(err);
        else callback(null, item);
    });
}

exports.getMentee = function(id, callback){
    Mentee.findById(id, function(err, item){
        if(err) callback(err);
        else callback(null, item);
    });
}

exports.getPlan = function(id, callback){
    Plan.findById(id, function(err, item){
        if(err) callback(err);
        else callback(null, item);
    });
}

// pass mentee id
exports.getPlanByMenteeId = function(id, callback){
    Mentee.findById(id, function(err, mentee){
        async.map(mentee.plans, function(planId, cb){
            Plan.findById(planId, function(err, plan){
                if (err) cb(err)
                else cb(null, plan)
            })
        }, function(err, plans){
            if (err) callback(err)
            else callback(null, plans)
        })
    })
}

// pass mentor id
exports.getPlanByMentorId = function(id, callback){
    Mentor.findById(id, function(err, mentor){
        if (err) callback(err)
        else {
            async.map(mentor.planInvitations, function(planId, cb){
                Plan.findById(planId, function(err, plan){
                    if (err) cb(err)
                    else cb(null, plan)
                })
            }, function(err, plans){
                if (err) callback(err)
                else callback(null, plans)
            })
        }
    })
}

// match skills, return at most n matched mentor
exports.matchSkills = function(skills, n, callback){
    Mentor.find({}, function(err, mentors){
        if (err) callback(err)

        splitSkills = skills.map(function(ele){
            return ele.toLowerCase().split(" ");
        })

        async.map(mentors, function(mentor, cb){
            cb(null, [mentor, matchScore(splitSkills, mentor.skills)])
        }, function(err, scores){

            scores.sort(this.compareScore)
//            console.log(scores)

            callback(null, scores.slice(0,n).filter(function(score){
                return score[1] > 0
            }).map(function(score){
                return score[0]
            }))
        })
    })
}

function matchScore(skills1, skills2) {
    if (skills1.length == 0 || skills2.length == 0)
        return 0

    var words2 = skills2.map(function(ele){
        return ele.toLowerCase().split(" ");
    }).reduce(function(a,b){
        return a.concat(b)
    })

    return skills1.filter(function(words1) {

        for (var i = 0; i < words1.length; i++) {
            if (words2.indexOf(words1[i]) != -1)
                return true;
        }
        return false;

    }).length;
}

// [[id, score],[id, score]..]
exports.compareScore = function(score1, score2) {
    if (score1[1] < score2[1])
        return 1;
    if (score1[1] > score2[1])
        return -1;
    return 0;
}