// Client-side module to cut a square from a picture

const Modal = require('client/head/modal');

const modalTemplate = require('./templates/modal.jade');
const clientRender = require('client/clientRender');

const PhotoCut = exports.PhotoCut = require('./photoCut');
require('blueimp-canvas-to-blob/js/canvas-to-blob');

module.exports = function(img, onSuccess) {
  var modal = new Modal();
  modal.setContent(clientRender(modalTemplate));

  var canvas = modal.elem.querySelector('.photo-cut__canvas');
  canvas.focus();
  var selectionCanvasElems = modal.elem.querySelectorAll('.photo-cut__selection-canvas');

  // copy size from CSS to scale correctly
  for (var i = 0; i < selectionCanvasElems.length; i++) {
    selectionCanvasElems[i].width = selectionCanvasElems[i].offsetWidth;
    selectionCanvasElems[i].height = selectionCanvasElems[i].offsetHeight;
  }

  var photoCut = new PhotoCut(canvas, { maxImageSize: 300 });
  photoCut.setImage(img);

  canvas.addEventListener("selection", function(event) {
    var selection = photoCut.getCanvasSelection();

    for (var i = 0; i < selectionCanvasElems.length; i++) {
      var elem = selectionCanvasElems[i];
      elem.getContext('2d').clearRect(0, 0, elem.width, elem.height);

      if (selection) {
        elem.getContext('2d').drawImage(
          selection.source,
          selection.x, selection.y, selection.size, selection.size, // from
          0, 0, elem.width, elem.height // to
        );
      }
    }
  });



  photoCut.setSelection({
    x: canvas.width * 0.1,
    size: Math.min(photoCut.width, photoCut.height) * 0.8,
    y: canvas.height * 0.1
  });

  modal.elem.querySelector('[data-action="rotate-right"]').addEventListener('click', () => photoCut.rotate(1));

  modal.elem.querySelector('[data-form]').addEventListener('submit', event => {
    event.preventDefault();
    save();
  });

  canvas.addEventListener('submit', event => {
    save();
  });

  function save() {
    var selection = photoCut.getCanvasSelection();

    if (!selection) return;

    var finalCanvas = document.createElement('canvas');

    // resize canvas to the actual selection part of the image,
    // to make as large as possible resolution/size avatar
    finalCanvas.width = selection.size;
    finalCanvas.height = selection.size;

    // draw the selected piece on the canvas to make Blob of it
    finalCanvas.getContext('2d').drawImage(
      selection.source, selection.x, selection.y, selection.size, selection.size,
      0, 0, selection.size, selection.size
    );

    modal.remove();

    finalCanvas.toBlob(
      function(blob) {
        onSuccess(blob);
      },
      'image/jpeg'
    );


  }

};
