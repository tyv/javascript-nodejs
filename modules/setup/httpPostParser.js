'use strict';

const HttpPostParser = require('httpPostParser');
const _ = require('lodash');

module.exports = function(app) {

  app.httpPostParser = new HttpPostParser();
  app.use(app.httpPostParser.middleware());

};
