// Client-side module to cut a square from a picture
const Modal = require('client/head/modal');

const modalTemplate = require('./templates/modal.jade');
const clientRender = require('client/clientRender');

const PhotoCut = exports.PhotoCut = require('./photoCut');
require('blueimp-canvas-to-blob/js/canvas-to-blob');

exports.cutPhoto = function(img, onSuccess) {
  var modal = new Modal();
  modal.setContent(clientRender(modalTemplate));

  var canvas = modal.elem.querySelector('.photo-cut__canvas');
  var selectionCanvas = modal.elem.querySelector('.photo-cut__selection-canvas');

  // copy size from CSS to scale correctly
  selectionCanvas.width = selectionCanvas.offsetHeight;
  selectionCanvas.height = selectionCanvas.offsetWidth;

  var photoCut = new PhotoCut(canvas, { maxImageSize: 300 });
  photoCut.setImage(img);

  /*
  photoCut.setSelection({
    x: canvas.width * 0.1,
    width: canvas.width * 0.8,
    y: canvas.height * 0.1,
    height: canvas.height * 0.8
  });*/

  var selectionCanvasContext = selectionCanvas.getContext('2d');

  canvas.addEventListener("selection", function(event) {
    var selection = photoCut.getCanvasSelection();
    selectionCanvasContext.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);

    if (selection) {
      selectionCanvasContext.drawImage(
        selection.source,
        selection.x, selection.y, selection.size, selection.size, // from
        0, 0, selectionCanvas.width, selectionCanvas.height // to
      );
    }
  });


  modal.elem.querySelector('[data-action="rotate-right"]').addEventListener('click', () => photoCut.rotate(1));

  modal.elem.querySelector('[data-action="rotate-left"]').addEventListener('click', () => photoCut.rotate(-1));

  modal.elem.querySelector('[data-action="done"]').addEventListener('click', () => {

    var selection = photoCut.getCanvasSelection();

    if (!selection) return;

    // resize canvas to the actual selection part of the image,
    // to make as large as possible resolution/size avatar
    selectionCanvas.width = selection.size;
    selectionCanvas.height = selection.size;


    // draw the selected piece on the canvas to make Blob of it
    selectionCanvas.getContext('2d').drawImage(
      selection.source, selection.x, selection.y, selection.size, selection.size,
      0, 0, selection.size, selection.size
    );

    modal.remove();

    selectionCanvas.toBlob(
      function (blob) {
        onSuccess(blob);
      },
      'image/jpeg'
    );


  });

};
