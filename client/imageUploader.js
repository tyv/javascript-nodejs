var xhr = require('client/xhr');

function ImageUploader(file) {
  this.file = file;
}

ImageUploader.prototype.upload = function() {
  var formData = new FormData();

//  imgur should check this, no?
//  if (!file.type.match(/image.*/)) {
//    throw new Error("Unsupported file type: " + file.type);
//  }

  formData.append("image", this.file);

  var request = xhr({
    method: 'POST',
    url: "https://api.imgur.com/3/image.json",
    json: true
  });

  // 400 when corrupt or invalid file
  request.successStatuses = [200, 400];

  request.setRequestHeader('Authorization', 'Client-ID 675c2d9b213e56b');

  setTimeout(function() {
    request.send(formData);
  }, 0);

  return request;

};

module.exports = ImageUploader;
