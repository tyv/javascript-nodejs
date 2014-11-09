const pathToRegexp = require('path-to-regexp');
const multiparty = require('multiparty');
const thunkify = require('thunkify');

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
    if (part.fileName != null) {
      callback(new Error('Files are not allowed here'));
    }
    part.on('error', onError);
  });

  form.on('error', onError);

  form.on('close', onDone);

  form.parse(req);

  function onDone() {
    if (hadError) return;
    callback(null, fields);
  }

  function onError(err) {
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
      this.log.debug("test " + this.req.url + " against " + path);
      if (path.test(this.req.url)) {
        this.log.debug("match found, disable parse");
        parse = false;
        break;
      }
    }

    if (parse) {
      this.request.body = yield self.parse(this.req);
    }

    yield* next;
  };
};


module.exports = function(app) {
  app.multipartParser = new MultipartParser();
  app.use(app.multipartParser.middleware());
};
