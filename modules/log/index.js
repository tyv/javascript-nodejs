// Usage: require('log')()

var bunyan = require('bunyan');
var requestSerializer = require('./requestSerializer');
var requestVerboseSerializer = require('./requestVerboseSerializer');
var resSerializer = require('./resSerializer');
var errSerializer = require('./errSerializer');
var httpErrorSerializer = require('./httpErrorSerializer');
var path = require('path');

const clsNamespace = require('continuation-local-storage').getNamespace('app');

var emit = bunyan.prototype._emit;
bunyan.prototype._emit = function(rec, noemit) {
  var clsContext = clsNamespace.get('context');
  if (clsContext) {
    if (!rec.requestId) {
      rec.requestId = clsContext.requestId;
    } else {
      if (rec.requestId != clsContext.requestId) {
        console.error("CLS returned wrong context? requestId of record must match current context.");
      }
    }
  }
  return emit.call(this, rec, noemit);
};


// log.debug({req: ...})
// exported => new serializers can be added by other modules
var serializers = exports.serializers = {
  requestVerbose: requestVerboseSerializer,
  request:        requestSerializer,
  res:            resSerializer,
  err:            errSerializer,
  httpError:      httpErrorSerializer
};

var streams = require('./streams');

// if no name, then name is a parent module filename (or it's directory if index)
module.exports = function(name) {
  if (!name) {
    name = path.basename(module.parent.filename, '.js');
    if (name == 'index') {
      name = path.basename(path.dirname(module.parent.filename)) + '/index';
    }
  }

  var logger = bunyan.createLogger({
    name:        name,
    streams:     streams,
    serializers: serializers
  });

  return logger;
};


delete require.cache[__filename];
