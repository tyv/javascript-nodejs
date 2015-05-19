/*
// load user photo and call onSuccess when done
// onSuccess(user object)

var loadSquarePhoto = require('photoCut').loadSquarePhoto;
var notification = require('client/notification');
var xhr = require('client/xhr');

module.exports = function({onSuccess, onLoadStart, onLoadEnd}) {

  loadSquarePhoto({
    minSize:   160,
    onSuccess: uploadPhoto
  });

  function uploadPhoto(file) {

    var formData = new FormData();
    formData.append("photo", file);

    var request = xhr({
      method: 'PATCH',
      url:    '/users/me',
      body:   formData,
      normalStatuses: [200, 400]
    });

    request.addEventListener('loadstart', onLoadStart);
    request.addEventListener('loadend', onLoadEnd);

    request.addEventListener('fail', (event) => {
      new notification.Error("Ошибка загрузки: " + event.reason);
    });

    request.addEventListener('success', (event) => {
      if (request.status == 400) {
        new notification.Error("Неверный тип файла или изображение повреждено.");
      } else {
        onSuccess(event.result);
      }
    });

  }

};
*/
