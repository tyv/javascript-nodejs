const _ = require('lodash');

module.exports = _.merge(
  require('./user'),
  require('./newsletter'),
  require('./payments'),
  require('./course'),
  require('./migrationState'),
  require('./videoKey')
);
