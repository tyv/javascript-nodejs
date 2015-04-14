const _ = require('lodash');

module.exports = _.merge(
  require('./user'),
  require('./newsletter'),
  require('./orderTemplate')
);
