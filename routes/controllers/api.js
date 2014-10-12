/**
 * Created by lan on 10/11/14.
 */
var Mentor = require('../../models/mentor.js');
var Mentee = require('../../models/mentee.js');
var Topic = require('../../models/topic.js');
var Template = require('../../models/template.js');

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

exports.addTopic = function(jsondata, callback){
    new Topic({
        topic: jsondata.topic,
        creator: jsondata.creator,
        skills: jsondata.skills
    }).save(function(err, topic){
            if (err) callback(err);

            // update mentee topics
            Mentee.findById(jsondata.creator, function(err, mentee){
                mentee.update({$push: {topics: topic.id}}, function(err){
                    if (err) callback(err);
                })
            });

            jsondata.skills.forEach(function(skill){
                Mentor.findById(skill.mentor, function(err, mentor){
                    mentor.update({$push: {topicInvitations: topic.id}}, function(err){
                        if (err) callback(err);
                    })
                })
            });

            callback(null, "Topic saved");

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


exports.updateTopic = function(jsondata, callback){
    if (err) callback(err)

    Topic.findById(jsondata.id, function(err, item){
        item.update({$set: {
            //TODO
        }}, function(err){
            if (err) allback(err);
            else callback(null, "Topic updated");
        })
    });
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

exports.getTopic = function(id, callback){
    Topic.findById(id, function(err, item){
        if(err) callback(err);
        else callback(null, item);
    });
}
