const pathToRegexp = require('path-to-regexp');
const multiparty = require('multiparty');
const thunkify = require('thunkify');

var log = require('log')();

function MultipartParser() {
  this.ignorePaths = [];
}

// csrf.addIgnore adds a path into "disabled csrf" list
MultipartParser.prototype.addIgnorePath = function(path) {
  if (path instanceof RegExp) {
    this.ignorePaths.push(path);
  } else if (typeof path == 'string') {
    this.ignorePaths.push(pathToRegexp(path));
  } else {
    throw new Error("unsupported path type: " + path);
  }
};

MultipartParser.prototype.parse = thunkify(function(req, callback) {

  var form = new multiparty.Form();

  var hadError = false;
  var fields = {};

  form.on('field', function(name, value) {
    fields[name] = value;
  });

  // multipart file must be the last
  form.on('part', function(part) {
    if (part.filename != null) {
      callback(new Error('Files are not allowed here'));
    } else {
      throw new Error("Must never reach this line (field event parses all fields)");
    }
    part.on('error', onError);
  });

  form.on('error', onError);

  form.on('close', onDone);

  form.parse(req);

  function onDone() {
    log.debug("multipart parse done", fields);
    if (hadError) return;
    callback(null, fields);
  }

  function onError(err) {
    log.debug("multipart error", err);
    if (hadError) return;
    hadError = true;
    callback(err);
  }

});


MultipartParser.prototype.middleware = function() {
  var self = this;

  return function*(next) {
    // skip these methods
    if (!~['POST', 'PUT', 'PATCH'].indexOf(this.method) || !this.get('content-type').startsWith('multipart/form-data')) {
      return yield* next;
    }

    var parse = true;
    for (var i = 0; i < self.ignorePaths.length; i++) {
      var path = self.ignorePaths[i];
      this.log.debug("multipart test " + this.path + " against " + path);
      if (path.test(this.path)) {
        this.log.debug("multipart match found, disable parse");
        parse = false;
        break;
      }
    }

    if (parse) {
      this.log.debug("multipart will parse");

      try {
        this.request.body = yield self.parse(this.req);
      } catch (e) {
        // form parsing error is always 400 :/
        // I hope that's really a parse error and not a programming error
        // (multiparty module should be rewritten here)
        this.throw(400, e.message);
      }

      this.log.debug("multipart done parse");
    }

    yield* next;
  };
};


module.exports = function(app) {
  app.multipartParser = new MultipartParser();
  app.use(app.multipartParser.middleware());
};
