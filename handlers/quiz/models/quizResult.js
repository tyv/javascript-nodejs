const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// An attempt of quiz solving by a user
const schema = new Schema({
  user:        {
    type: Schema.Types.ObjectId,
    ref:  'User'
  },
  // we keep full information about the quiz, not linking by id,
  // because the quiz may be replaced
  // and even deleted
  // but the information must stay
  quizSlug:        {
    type: String,
    required: true
  },

  quizTitle:        {
    type: String,
    required: true
  },

  quizScore: {
    type: Number,
    required: true
  },

  quizTime: {
    type: Number,
    required: true
  },

  created: {
    type: Date,
    required: true,
    default: Date.now
  }
});

module.exports = mongoose.model('QuizResult', schema);