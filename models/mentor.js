/**
 * Created by lan on 10/11/14.
 */
var mongoose = require('mongoose')
    ,Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

var mentorSchema = new Schema({
    _id: String, //linkedin id
    url: String,
    picURL: String,
    skills: [String],
    firstName: String,
    lastName: String,
    headline: String,
    industry: String,
    rate: {
        numberOfRating: Number,
        rating: Number
    },
    planInvitations: [ObjectId]
});

module.exports = mongoose.model('Mentor', mentorSchema);