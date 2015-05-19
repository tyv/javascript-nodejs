
var capitalizeKeys = require('lib/capitalizeKeys');
var BadImageError = require('./badImageError');
var mime = require('mime');
var imgurRequest = require('./imgurRequest');
var ImgurImage = require('../models/imgurImage');

/*
 custom_file: {
 value:  fs.createReadStream('/dev/urandom'),
 options: {
 filename: 'topsecret.jpg',
 contentType: 'image/jpg'
 }
 */

/**
 * Uploads a stream (file or multiparty part or...)
 * @param fileName fileName (for mime)
 * @param knownLength contentLength (from file stream request could get it, but not from multiparty part)
 * @param stream
 * @returns {*}
 */
module.exports = function*(fileName, knownLength, stream) {

  if (!knownLength) {
    throw new BadImageError("Пустое изображение.");
  }
  var mimeType = mime.lookup(fileName);

  var response = yield* imgurRequest('image', {
    formData: {
      type:  'file',
      image: {
        value: stream,
        options: {
          filename: fileName,
          contentType: mimeType,
          knownLength: knownLength
        }
      }
    }
  });

  return yield ImgurImage.createFromResponse(response);
};
