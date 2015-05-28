var thumb = require('client/image').thumb;
var PhotoLoadWidget = require('../lib/photoLoadWidget');

function init() {

  initPhotoLoadWidget();

}


function initPhotoLoadWidget() {
  var photoWidgetElem = document.querySelector('[data-photo-load]');
  if (!photoWidgetElem) return;
  new PhotoLoadWidget({
    elem: photoWidgetElem,
    onSuccess: function(imgurImage) {
      photoWidgetElem.querySelector('i').style.backgroundImage = `url('${thumb(imgurImage.link, 64, 64)}')`;
      photoWidgetElem.querySelector('input').value = imgurImage.imgurId;
    },
    onLoadStart: function() {
      photoWidgetElem.classList.add('modal-overlay_light');
    },
    onLoadEnd: function() {
      photoWidgetElem.classList.remove('modal-overlay_light');
    }
  });
}

init();
