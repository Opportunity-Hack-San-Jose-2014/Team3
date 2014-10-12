/**
 * Created by lan on 10/11/14.
 */

var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

var dom = new Schema({
    dom: String,
    mentor: String,
    confirmed: {type: String, default: 'Pending'},
    inviteDate: {type: Date, default: Date.now},
    confirmDate: Date
}, {
    _id: false
});

var planSchema = new Schema({
    planName:  String,
    category: String,
    age: Number,
    location: String,
    description: String,
    creator: String,
    date: {type: Date, default: Date.now},
    domains: [dom],
    status: {type: String, default: 'Active'}
});

module.exports = mongoose.model('Plan', planSchema);