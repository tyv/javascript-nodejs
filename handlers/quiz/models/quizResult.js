const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// An attempt of quiz solving by a user
const schema = new Schema({
  user:        {
    type: Schema.Types.ObjectId,
    ref:  'User'
  },
  quiz:        {
    type: Schema.Types.ObjectId,
    ref:  'Quiz'
  },

  // answers are appended here
  answers: [{}]
});

module.exports = mongoose.model('QuizResult', schema);