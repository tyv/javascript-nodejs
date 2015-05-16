// Client-side module to cut a square from a picture
var notification = require('client/notification');
var modalPhotoCut = require('./modalPhotoCut');

module.exports = function({minSize, onSuccess}) {
  var fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = "image/*";

  fileInput.onchange = function() {
    fileInput.remove();
    var reader = new FileReader();
    var file = fileInput.files[0];

    reader.onload = function(event) {
      var image = new Image();
      image.onload = function() {

        if (image.height < minSize || image.width < minSize) {
          new notification.Error(`Изображение должно иметь размер ${minSize}x${minSize} или больше`);
        } else if (image.width == image.height) {
          onSuccess(file);
        } else {
          modalPhotoCut(image, function(blob) {
            // @see http://stackoverflow.com/questions/13198131/how-to-save-a-html5-canvas-as-image-on-a-server
            // @see http://stackoverflow.com/questions/12391628/how-can-i-upload-an-embedded-image-with-javascript
            onSuccess(blob);
          });
        }
      };
      image.src = event.target.result;
    };
    reader.readAsDataURL(file);

  };

  // must be in body for IE
  fileInput.hidden = true;
  document.body.appendChild(fileInput);
  fileInput.click();

};
