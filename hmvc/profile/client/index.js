

var AuthProvidersManager = require('./authProvidersManager');
var PhotoChanger = require('./photoChanger');

exports.init = function() {
  new AuthProvidersManager();
  new PhotoChanger();
};
