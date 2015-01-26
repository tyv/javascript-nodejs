const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');
const assert = require('assert');

const schema = new Schema({
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
  answers: [{}], // array of generic answer variants
  correctAnswer: {}, // generic correct answer,
  correctAnswerComment: String // why is the answer correct, optional comment
});

Schema.methods.checkAnswer = function(answer) {
  switch (this.type) {
  case 'single':
    return this.correctAnswer == answer;
  case 'multi':
    assert(Array.isArray(answer));
    return _.isEqual( this.correctAnswer.sort(), answer.sort());
  }

};


module.exports = mongoose.model('QuizQuestion', schema);