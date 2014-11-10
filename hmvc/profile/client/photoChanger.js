var delegate = require('client/delegate');
var xhr = require('client/xhr');
var notify = require('client/notify');

function PhotoChanger() {
  this.elem = document.body.querySelector('[data-action="photo-change"]');

  this.elem.addEventListener('click', function(event) {
    event.preventDefault();
    this.changePhoto();
  }.bind(this));
}

PhotoChanger.prototype.changePhoto = function() {
  var fileInput = document.createElement('input');
  fileInput.type = 'file';
  //fileInput.accept = "image/*";

  var self = this;
  fileInput.onchange = function() {
    self.upload(this.files[0]);
  };
  fileInput.click();
};

PhotoChanger.prototype.updateUserPhoto = function(link) {
  this.elem.style.backgroundImage = 'url("' + link.replace(/(\.\w+)$/, window.devicePixelRatio > 1 ? 'm$1' : 't$1') + '")';
};


PhotoChanger.prototype.upload = function(file) {

  var formData = new FormData();

  formData.append("photo", file);

  var request = xhr({
    method: 'PATCH',
    url: '/users/me',
    json: true,
    body: formData
  });

  // 400 when corrupt or invalid file
  request.successStatuses = [200, 400];

  var self = this;
  request.addEventListener('success', function(e) {
    if (this.status == 400) {
      notify.error("Неверный тип файла или изображение повреждено.");
      return;
    }

    self.updateUserPhoto(e.result.photo);
  });

};

delegate.delegateMixin(PhotoChanger.prototype);

module.exports = PhotoChanger;
