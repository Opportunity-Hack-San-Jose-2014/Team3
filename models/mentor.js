/**
 * Created by lan on 10/11/14.
 */
var mongoose = require('mongoose')
    ,Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

var mentorSchema = new Schema({
    _id: String, //linkedin id
    url: String,
    skills: [String],
    contact: {
        firstName: String,
        lastName: String,
        email: String,
        phone: Number,
        address: String
    },
    rate: {
        numberOfRating: Number,
        rating: Number
    },
    topicInvitations: [{type: ObjectId, ref: "Topic"}]
});

module.exports = mongoose.model('Mentor', mentorSchema);