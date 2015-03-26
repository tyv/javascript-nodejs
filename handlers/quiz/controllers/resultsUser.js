const config = require('config');
const mongoose = require('mongoose');
const QuizResult = require('../models/quizResult');
const User = require('users').User;

exports.get = function*() {


  try {
    new mongoose.Types.ObjectId(this.params.id);
  } catch (e) {
    // cast error (invalid id)
    this.throw(404);
  }

  var user = yield User.findById(this.params.id).exec();

  if (!user) {
    this.throw(404);
  }

  if (String(this.req.user._id) != String(user._id)) {
    this.throw(403);
  }

  var results = yield QuizResult.find({user: user._id}).sort('-created').exec();

  results = results.map(function(result) {
    return {
      created: result.created,
      quizTitle: result.quizTitle,
      score: result.score,
      level: result.level,
      levelTitle: result.levelTitle,
      time: result.time
    };
  });

  this.body = results;

};
