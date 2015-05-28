var promptSquarePhoto = require('photoCut').promptSquarePhoto;
var notification = require('client/notification');
var xhr = require('client/xhr');
var Spinner = require('client/spinner');

function PhotoLoadWidget({elem, onSuccess, onLoadStart, onLoadEnd}) {
  var link = elem.querySelector('a');
  var photoDiv = elem.querySelector('i');
  var input = elem.querySelector('input');

  link.onclick = function(e) {
    e.preventDefault();
    promptSquarePhoto({
      minSize:   160,
      onSuccess: uploadPhoto
    });
  };


  var spinner = new Spinner({
    elem: photoDiv,
    size: 'small'
  });

  function uploadPhoto(file) {

    var formData = new FormData();
    formData.append("photo", file);

    var request = xhr({
      method: 'POST',
      url:    '/imgur/upload',
      body:   formData,
      noDocumentEvents: true,
      normalStatuses: [200, 400]
    });

    request.addEventListener('loadstart', function() {
      spinner.start();
      onLoadStart();
    });
    request.addEventListener('loadend',   function() {
      spinner.stop();
      onLoadEnd();
    });

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


}

module.exports = PhotoLoadWidget;
