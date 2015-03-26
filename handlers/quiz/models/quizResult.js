const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// An attempt of quiz solving
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

  level:     {
    type: String,
    enum: ['junior','medium', 'senior'],
    required: true
  },

  score: {
    type: Number,
    required: true
  },

  time: {
    type: Number,
    required: true
  },

  // better than XX% participants is not stored here,
  // because it is not persistent

  created: {
    type: Date,
    required: true,
    default: Date.now
  }
});

schema.virtual('levelTitle').get(function() {
  return {junior: 'новичок', medium: 'средний', senior: 'профи'}[this.level];
});

module.exports = mongoose.model('QuizResult', schema);