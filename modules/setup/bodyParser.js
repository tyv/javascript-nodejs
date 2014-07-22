'use strict';

const BodyParser = require('lib/bodyparser').BodyParser;
const _ = require('lodash');

module.exports = function(app) {

  app.bodyParser = new BodyParser();
  app.use(app.bodyParser.middleware());

};
