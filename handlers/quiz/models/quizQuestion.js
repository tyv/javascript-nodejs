const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('config');
const path = require('path');
const assert = require('assert');
const _ = require('lodash');


const schema = new Schema({
  content: {
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
  correctAnswer: {}, // generic correct answer, e.g Number or [Number] for multi
  correctAnswerComment: String // why is the answer correct, optional comment
});

schema.path('correctAnswer').validate(function (value) {
  if (this.type == 'single') {
    // 1 number
    return typeof value == 'number';
  }

  if (this.type == 'multi') {
    // array of numbers
    return Array.isArray(value) && !value.filter(function(v) {
        return typeof v != 'number';
      }).length;
  }

}, 'Invalid color');


schema.methods.getAnswerScore = function(answer) {

  switch (this.type) {
  case 'single':
    return this.correctAnswer == answer ? 1 : 0;
  case 'multi':
    assert(Array.isArray(answer));
    assert(Array.isArray(this.correctAnswer));
    /*
     var correctCount = 0;

     for(var i=0; i<this.answers.length; i++) {
     // if i-th answer is correct and included get +1
     if (~this.correctAnswer.indexOf(i)) {
     if (~answer.indexOf(i)) correctCount++;
     }
     }
     this.correctAnswer.forEach(function(correctAnswerItem) {
     // for each correct answer check if
     if ()
     });
     */
    return _.isEqual( this.correctAnswer.sort(), answer.sort()) ? 1 : 0;
  }

};


module.exports = mongoose.model('QuizQuestion', schema);