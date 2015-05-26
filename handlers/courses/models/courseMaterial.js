var mongoose = require('lib/mongoose');
var Schema = mongoose.Schema;
var fs = require('mz/fs');
var config = require('config');
var path = require('path');

var schema = new Schema({
  // Введение в JavaScript
  title: {
    type: String,
    required: true
  },

  // 2015_05_05_1930.zip
  filename: {
    type: String,
    required: true
  },

  created: {
    type:    Date,
    default: Date.now
  }

});


module.exports = mongoose.model('CourseMaterial', schema);
