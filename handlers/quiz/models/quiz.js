const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('config');
const path = require('path');
const assert = require('assert');
const _ = require('lodash');

const quizQuestionSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  // question types, determines how to show/check answers
  // single - a selection 1 from many, correctAnswer is the number
  // multi - a selection of many from many, correctAnswer is a set
  // for future possible: string - string match, eval - JS result eval match
  type: {
    type: String,
    required: true,
    default: 'single',
    enum: ['single', 'multi']
  },
  answers: [{}], // array of generic answer variants, e.g. [String]
  correctAnswer: {}, // generic correct answer, e.g Number
  correctAnswerComment: String // why is the answer correct, optional comment
});

quizQuestionSchema.methods.checkAnswer = function(answer) {

  switch (this.type) {
  case 'single':
    return this.correctAnswer == answer;
  case 'multi':
    assert(Array.isArray(answer));
    assert(Array.isArray(this.correctAnswer));
    return _.isEqual( this.correctAnswer.sort(), answer.sort());
  }

};




const quizSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  slug: {
    type:     String,
    unique:   true,
    required: true,
    index:    true
  },
  questionsToAskCount: {
    type: Number,
    required: true
  },
  questions: [quizQuestionSchema]
});


quizSchema.statics.getUrlBySlug = function(slug) {
  return '/quiz/' + slug;
};

quizSchema.methods.getUrl = function() {
  return quizSchema.statics.getUrlBySlug(this.get('slug'));
};


module.exports = mongoose.model('Quiz', quizSchema);