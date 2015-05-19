
var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');

exports.init = function(app) {

  app.multipartParser.ignore.add('/imgur/upload');

  app.use(mountHandlerMiddleware('/imgur', __dirname));
};

exports.ImgurImage = require('./models/imgurImage');
exports.transload = require('./lib/transload');
exports.uploadStream = require('./lib/uploadStream');
