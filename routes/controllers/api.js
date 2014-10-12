/**
 * Created by lan on 10/11/14.
 */
var Mentor = require('../../models/mentor.js');
var Mentee = require('../../models/mentee.js');
var Topic = require('../../models/topic.js');
var Template = require('../../models/template.js');

exports.addMentor = function(req, res){
    new Mentor({
        _id: req.body.id,
        url: req.body.url
    }).save(function(err){
            if (err) console.log(err);
            else res.send("Mentor saved");
        });
}

exports.addMentee = function(req, res){
    new Mentee({
        _id: req.body.id,
        url: req.body.url
    }).save(function(err){
            if (err) console.log(err);
            else res.send("Mentee saved");
        });
}

exports.addTopic = function(req, res){
    var skills = JSON.parse(req.body.skills);
    new Topic({
        topic: req.body.topic,
        creator: req.body.creator,
        skills: skills
    }).save(function(err, topic){
            if (err) console.log(err);

            // update mentee topics
            Mentee.findById(req.body.creator, function(err, mentee){
                mentee.update({$push: {topics: topic.id}}, function(err){
                    if (err) console.log(err);
                    else console.log(mentee);
                })
            });

            skills.forEach(function(skill){
                Mentor.findById(skill.mentor, function(err, mentor){
                    mentor.update({$push: {topicInvitations: topic.id}}, function(err){
                        if (err) console.log(err);
                        else console.log(mentor);
                    })
                })
            });

            res.send("Topic saved");

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
