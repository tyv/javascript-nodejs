'use strict';

const koaFormidable = require('koa-formidable');
const _ = require('lodash');
const pathToRegexp = require('path-to-regexp');

/**
 * Wrapper around koa-bodyparser
 * allows to set per-path options which are used in middleware
 * usage:
 *
 * app.httpPostParser = new HttpPostParser
 * app.use(app.bodyParser.middleware())
 * ...
 * app.httpPostParser.addPathOptions('/upload/path', {bytesExpected: 1e10});
 * @constructor
 */
function HttpPostParser() {
  this.pathOptions = [];
}

// options should be an object { path: string|regexp, options }
HttpPostParser.prototype.addPathOptions = function(path, options) {
  if (path instanceof RegExp) {
    this.pathOptions.push({path: path, options: options});
  } else if (typeof path == 'string') {
    this.pathOptions.push({path: pathToRegexp(path), options: options});
  } else {
    throw new Error("unsupported path type: " + path);
  }
};

HttpPostParser.prototype.middleware = function() {

  var self = this;
  var optionsDefault = { bytesExpected: 1e7 };

  return function* (next) {
    var options = Object.create(optionsDefault);

    for (var i = 0; i < self.pathOptions.length; i++) {
      var path = self.pathOptions[i].path;
      this.log.debug("test " + this.req.url + " against " + path);
      if (path.test(this.req.url)) {
        this.log.debug("found options", self.pathOptions[i].options);
        _.assign(options, self.pathOptions[i].options);
        break;
      }
    }

    // if request file too big, don't start accepting it
    // in normal situation, large uploads have the header and get stopped here
    if (this.get('content-length')) {
      var bytesExpected = parseInt(this.get('content-length'), 10);

      if (bytesExpected > options.bytesExpected) {
        this.status = 413;
        this.body = 'Request entity too large: ' + bytesExpected + ' > ' + options.bytesExpected;
        return;
      }
    }

    // safety:
    // even if a bad person did not supply content-length,
    // formidable will not read more than options.bytesExpected


    yield* koaFormidable(options).call(this, next);

  };
};


module.exports = HttpPostParser;
