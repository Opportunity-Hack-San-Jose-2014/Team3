/**
 * Created by lan on 10/11/14.
 */

var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

var skill = new Schema({
    skill: String,
    mentor: String,
    matched: {type: String, default: 'Pending'}
}, {
    _id: false
});

var topicSchema = new Schema({
    topic:  String,
    creator: String,
    date: {type: Date, default: Date.now},
    skills: [skill],
    status: {type: String, default: 'Active'}
});

module.exports = mongoose.model('Topic', topicSchema);