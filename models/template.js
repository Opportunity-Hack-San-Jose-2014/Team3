/**
 * Created by lan on 10/11/14.
 */
var mongoose = require('mongoose')
    ,Schema = mongoose.Schema;

var dom = new Schema({
    dom: String,
    skills: [String]
}, {
    _id: false
})

var templateSchema = new Schema({
    _id: String,
    domains: [dom]
});

module.exports = mongoose.model('Template', templateSchema);