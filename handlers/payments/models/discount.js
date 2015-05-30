var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var OrderTemplate = require('./orderTemplate');
var Transaction = require('./transaction');
var _ = require('lodash');

var schema = new Schema({
  discount:      {
    type:     Number,
    required: true
  },


  module: {
    type: String,
    required: true
  },

  // data for the module
  data: {},

  code: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return Math.random().toString(36).slice(2, 10);
    }
  },

  isActive: {
    type:    Boolean,
    default: true
  },

  created:  {
    type:    Date,
    default: Date.now
  }

});

/**
 * find active discount with the code
 * if discount has onlyModule set, ensure the match
 * @param code
 * @param onlyModule
 * @returns {*}
 */
schema.statics.findByCodeAndModule = function*(code, module) {
  return yield Discount.findOne({code: code, isActive: true, module: module}).exec();
};

schema.methods.adjustAmount = function(amount) {
  return this.discount < 1 ? amount * this.discount : this.discount;
};

var Discount = module.exports = mongoose.model('Discount', schema);

