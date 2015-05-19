var mongoose = require('lib/mongoose');
var Schema = mongoose.Schema;
var config = require('config');
var fs = require('mz/fs');
var path = require('path');
var log = require('log')();
var validate = require('validate');
var countries = require('countries');

var schema = {
  firstName:  {
    type:      String,
    validate:  [
      {validator: /\S/, msg: "Имя отсутствует."},
      {validator: validate.patterns.singleword, msg: "Имя дожно состоять из одного слова."}
    ],
    default: "",
    maxlength: 128
  },
  surname:    {
    type:      String,
    validate:  [
      {validator: /\S/, msg: "Фамилия отсутствует."},
      {validator: validate.patterns.singleword, msg: "Фамилия должна состоять из одного слова."}
    ],
    default: "",
    maxlength: 128
  },
  photo:      {
    type: String
  },
  country:    {
    type: String,
    enum: Object.keys(countries.all),
    required: "Страна не указана."
  },
  city:       {
    type:      String,
    maxlength: 128
  },
  aboutLink:  {
    type:      String,
    validate:  [
      function(value) { return value ? validate.patterns.webpageUrl.test(value) : true; },
      "Некорректный URL страницы."
    ],
    maxlength: 4 * 1024
  },
  occupation: {
    type:      String,
    maxlength: 2 * 1024
  },
  purpose:    {
    type:      String,
    maxlength: 16 * 1024
  },
  wishes:     {
    type:      String,
    maxlength: 16 * 1024
  },

  user: {
    type: Schema.Types.ObjectId,
    ref:  'User',
    index: true,
    required: true
  },

  videoKey: {
    type: String
    // there may be groups without video & keys
    // for those with videos, video key is stored in participant
  }
};

module.exports = mongoose.model('CourseParticipant', new Schema(schema));
//module.exports.schemaObject = schema;
