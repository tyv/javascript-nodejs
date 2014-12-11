

var AuthProvidersManager = require('./authProvidersManager');
var PhotoChanger = require('./photoChanger');
var ProfileEditor = require('./profileEditor');

exports.init = function() {
  new AuthProvidersManager();
  new PhotoChanger();
  new ProfileEditor();
};


window.profile = module.exports;