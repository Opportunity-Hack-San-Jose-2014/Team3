/**
 * Created by lan on 10/11/14.
 */
var mongoose = require('mongoose')
    ,Schema = mongoose.Schema;

var templateSchema = new Schema({
    _id: String,
    skills: [String]
});

module.exports = mongoose.model('Template', templateSchema);