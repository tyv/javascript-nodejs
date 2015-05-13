// Usage: require('log')()

var bunyan = require('bunyan');
var requestSerializer = require('./requestSerializer');
var requestVerboseSerializer = require('./requestVerboseSerializer');
var resSerializer = require('./resSerializer');
var errSerializer = require('./errSerializer');
var httpErrorSerializer = require('./httpErrorSerializer');
var path = require('path');

const CLS = require('continuation-local-storage');

var emit = bunyan.prototype._emit;
bunyan.prototype._emit = function addReqIdToEveryRecord(rec, noemit) {
  // get it runtime, so that it may be require'd later than this module
  const clsNamespace = CLS.getNamespace('app');

  if (clsNamespace) {
    var clsContext = clsNamespace.get('context');

    if (clsContext) {
      if (!rec.requestId) {
        rec.requestId = clsContext.requestId;
      } else {
        if (rec.requestId != clsContext.requestId) {
          console.error(`LOG: CLS returned wrong context? (${rec.requestId}) != (${clsContext.requestId}).`, rec);
        }
      }
    }
  } else {
    console.error("LOG: no CLS namespace");
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
