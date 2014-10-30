var request = require('koa-request');
var config = require('config');
function* uploadPlunk(plunkContent) {



  if (plunkContent.plunk.id) {
    var existingPlunkResponse = yield request({
      url:
    })
    plunkContent.plunk =
  }
    api.getPlunk(plunkContent.plunk.id, function(error, plunk) {
      if (error) return callback(error);
      plunkContent.plunk = plunk || {};
      callback(null);
    });
  }