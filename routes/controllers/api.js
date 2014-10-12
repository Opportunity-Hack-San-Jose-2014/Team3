/**
 * Created by lan on 10/11/14.
 */
var Mentor = require('../../models/mentor.js');
var Mentee = require('../../models/mentee.js');
var Topic = require('../../models/topic.js');
var Template = require('../../models/template.js');

exports.findMentor = function(id, callback){
    Mentee.findById(id, function(err, mentee){
        if (err) callback(err);
        else callback(null, mentee != null);
    });
}

exports.addMentor = function(jsondata, callback){
    new Mentor({
        _id: jsondata.id,
        url: jsondata.url
    }).save(function(err){
            if (err) callback(err);
            else callback(null, "Mentor saved");
        });
}

exports.addMentee = function(jsondata, callback){
    new Mentee({
        _id: jsondata.id,
        url: jsondata.url
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

exports.updateMentor = function(req, res){
    Mentor.findById(req.params.id, function(err, item){
        item.update({$set: {
            skills: (req.body.skills ? JSON.parse(req.body.skills) : item.skills),
            contact: (req.body.contact ? JSON.parse(req.body.contact) : item.contact),
            rating: (req.body.rating ? JSON.parse(req.body.rating) : item.rating)
        }}, function(err){
            if (err) console.log(err);
            else res.send(item);
        })
    });
}


exports.updateMentee = function(req, res){
    Mentee.findById(req.params.id, function(err, item){
        item.update({$set: {
            contact: (req.body.contact ? JSON.parse(req.body.contact) : item.contact)
        }}, function(err){
            if (err) console.log(err);
            else res.send(item);
        })
    });
}

exports.updateTopic = function(req, res){
    Topic.findById(req.params.id, function(err, item){
        item.update({$set: {
            contact: (req.body.contact ? JSON.parse(req.body.contact) : item.contact)
        }}, function(err){
            if (err) console.log(err);
            else res.send(item);
        })
    });
}


exports.getMentor = function(req, res){
    Mentor.findById(req.params.id, function(err, item){
        res.send(item);
    });
}

exports.getMentee = function(req, res){
    Mentee.findById(req.params.id, function(err, item){
        res.send(item);
    });
}

exports.getTopic = function(req, res){
    Topic.findById(req.params.id, function(err, item){
        res.send(item);
    });
}
