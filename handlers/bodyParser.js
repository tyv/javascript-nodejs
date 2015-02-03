const bodyParser = require('koa-bodyparser');

exports.init = function(app) {
  // default limits are:
  // formLimit: limit of the urlencoded body. If the body ends up being larger than this limit, a 413 error code is returned.
  //   Default is 56kb
  // jsonLimit: limit of the json body.
  //   Default is 1mb

  app.use(bodyParser());

};
