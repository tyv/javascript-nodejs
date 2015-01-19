const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  title: {
    type: String,
    required: true
  },
  // question types, determines how to show/check answers
  // choice - a selection 1 from many, correctAnswer is the number
  // for future possible: string - string match, eval - JS result eval match
  type: {
    type: String,
    default: 'choice',
    enum: ['choice']
  },
  answers: [{}], // array of generic answer variants
  correctAnswer: {}, // generic correct answer,
  correctAnswerComment: String // why is the answer correct, optional comment
});

Schema.methods.checkAnswer = function(answer) {
  return this.correctAnswer == answer;
};


module.exports = mongoose.model('QuizQuestion', schema);