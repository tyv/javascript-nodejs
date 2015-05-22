var thumb = require('client/image').thumb;
var promptSquarePhoto = require('photoCut').promptSquarePhoto;
var notification = require('client/notification');
var xhr = require('client/xhr');
var Spinner = require('client/spinner');

function init() {

  initPhotoLoadWidget();

}


function initPhotoLoadWidget() {
  var photoWidgetElem = document.querySelector('[data-photo-load]');
  if (!photoWidgetElem) return;
  new PhotoLoadWidget({
    elem: photoWidgetElem
  });
}

function PhotoLoadWidget({elem}) {
  var link = elem.querySelector('a');
  var photoDiv = elem.querySelector('div');
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


  function onSuccess(imgurImage) {
    photoDiv.style.backgroundImage = `url('${thumb(imgurImage.link, 64, 64)}')`;
    input.value = imgurImage.imgurId;
  }


  function onLoadStart() {
    spinner.start();
    elem.classList.add('modal-overlay_light');
  }

  function onLoadEnd() {
    spinner.stop();
    elem.classList.remove('modal-overlay_light');
  }
}


init();
