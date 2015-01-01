var co = require('co');
var app = require('app');

module.exports = function() {
  return function() {

    return co(require('app').waitBootAndListen());

  };
};

