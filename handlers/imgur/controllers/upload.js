
var multiparty = require('multiparty');
var uploadStream = require('../lib/uploadStream');
var co = require('co');
var ImgurImage = require('../models/imgurImage');

exports.post = function*() {

  var self = this;

  var imgurImage;
  try {
    imgurImage = yield new Promise(function(resolve, reject) {

      var form = new multiparty.Form();

      // multipart file must be the last
      form.on('part', function(part) {
        self.log.debug("Part", part.name, part.filename);

        if (!part.filename) {
          reject(new Error("No filename for form part " + part.name));
          return;
        }

        co(function*() {
          // filename='blob' for FormData(photo, blob) where blob comes from canvas.toBlob
          return yield* uploadStream(part.filename, part.byteCount, part);
        }).then(function(result) {
          resolve(result);
        }).catch(reject);
      });

      form.on('error', reject);

      form.parse(self.req);

    });
  } catch(e) {
    if (e instanceof BadImageError) {
      this.status = 400;
      this.body = e.message;
      return;
    } else {
      throw e;
    }
  }


  this.body = {
    link: imgurImage.link,
    imgurId: imgurImage.imgurId
  };

};
