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
        firstName: jsondata.firstName,
        lastName: jsondata.lastName,
        headline: jsondata.headline,
        industry: jsondata.industry,
        skills: skills
    }).save(function(err){
            if (err) callback(err);
            else callback(null, "Mentor saved");
        });
}

exports.addMentee = function(jsondata, callback){
    new Mentee({
        _id: jsondata.id,
        url: jsondata.publicProfileUrl,
        firstName: jsondata.firstName,
        lastName: jsondata.lastName,
        headline: jsondata.headline,
        industry: jsondata.industry
    }).save(function(err){
            if (err) callback(err);
            else callback(null, "Mentee saved");
        });
}

exports.addPlan = function(jsondata, callback){
    new Plan({
        topic: jsondata.topic,
        creator: jsondata.creator,
        neededSkills: jsondata.neededSkills
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
                    async.each(jsondata.neededSkills, function(skill, innercb){
                        Mentor.findById(skill.mentor, function(err, mentor){
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
                else callback(null, "Plan saved");
            })
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
            firstName: jsondata.firstName,
            lastName: jsondata.lastName,
            headline: jsondata.headline,
            industry: jsondata.industry,
            skills: skills
        }}, function(err){
            if (err) callback(err);
            else callback(null, "Mentor updated");
        })
    });
}


exports.updateMentee = function(jsondata, callback){
    Mentee.findById(jsondata.id, function(err, item){
        if (err) callback(err)

        item.update({$set: {
            url: jsondata.publicProfileUrl,
            firstName: jsondata.firstName,
            lastName: jsondata.lastName,
            headline: jsondata.headline,
            industry: jsondata.industry
        }}, function(err){
            if (err) callback(err);
            else callback(null, "Mentee updated");
        })
    });
}

// {plan: id, mentor: id, confirmed: Accepted/Rejected}
exports.confirmPlan = function(jsondata, callback){
    Plan.update({
        _id : jsondata.plan,
        "neededSkills.mentor": jsondata.mentor
    }, {
        $set: {"neededSkills.$.confirmed": jsondata.confirmed}
    }, function(err){
            if (err) callback(err);
            else callback(null, "Plan updated");
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
