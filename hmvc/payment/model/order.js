var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var schema = new Schema({
  amount:  {
    type:     Number,
    required: true
  },
  module:  { // module so that transaction handler knows where to go back e.g. 'getpdf'
    type:     String,
    required: true
  },
  data:    String,
  created: {
    type:    Date,
    default: Date.now
  }
});

schema.methods.getSuccessUrl = function() {
  return '/' + this.module + '/success';
};

schema.methods.getFailUrl = function() {
  return '/' + this.module + '/fail';
};

schema.plugin(autoIncrement.plugin, {model: 'Order', field: 'number'});

mongoose.model('Order', schema);

