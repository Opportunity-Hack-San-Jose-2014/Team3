/**
 * Created by lan on 10/11/14.
 */
var mongoose = require('mongoose')
    ,Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId;

var menteeSchema = new Schema({
    _id: String,
    url: String,
    firstName: String,
    lastName: String,
    headline: String,
    industry: String,
    topics: [ObjectId]
});

module.exports = mongoose.model('Mentee', menteeSchema);