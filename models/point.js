// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var PointSchema   = new mongoose.Schema({
    lastPrice : Number,
    daysLow : Number,
    daysHigh : Number,
    timestamp : Number,
    k : Number,
    d : Number
});

// Export the Mongoose model
module.exports = mongoose.model('Point', PointSchema);