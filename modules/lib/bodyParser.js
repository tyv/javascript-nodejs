'use strict';

const koaBodyParser = require('koa-bodyparser');
const _ = require('lodash');
const pathToRegexp = require('path-to-regexp');
const log = require('js-log')();

/**
 * Wrapper around koa-bodyparser
 * allows to set per-path options which are used in middleware
 * usage:
 *
 * app.bodyParser = new BodyParser
 * app.use(app.bodyParser.middleware())
 * ...
 * app.bodyParser.addPathOptions('/upload/path', {limit: 1e10});
 * @constructor
 */
function BodyParser() {
  this.pathOptions = [];
}

// options should be an object { path: string|regexp, options }
BodyParser.prototype.addPathOptions = function(path, options) {
  if (path instanceof RegExp) {
    this.pathOptions.push({path: path, options: options});
  } else if (typeof path == 'string') {
    this.pathOptions.push({path: pathToRegexp(path), options: options});
  } else {
    throw new Error("unsupported path type: " + path);
  }
};

BodyParser.prototype.middleware = function() {

  var self = this;
  var optionsDefault = { limit: 1e6 };

  return function* (next) {
    var options = Object.create(optionsDefault);
    for (var i = 0; i < self.pathOptions.length; i++) {
      var path = self.pathOptions[i].path;
      log.debug("test " + this.req.url + " against " + path);
      if (path.test(this.req.url)) {
        log.debug("found options", self.pathOptions[i].options);
        _.assign(options, self.pathOptions[i].options);
        break;
      }
    }

    yield* koaBodyParser(options).call(this, next);

  };
};


exports.BodyParser = BodyParser;
