var migrate = require('../migrate');
var co = require('co');

module.exports = function() {

  return function() {
    return co(migrate(-1));
  };

};
