
/* Показать полупрозрачный DIV, затеняющий всю страницу
 (а форма будет не в нем, а рядом с ним, чтобы не полупрозрачная) */
function showCover() {
  var coverDiv = document.createElement('div');
  coverDiv.className = 'cover-div';
  document.body.appendChild(coverDiv);
}

function hideCover() {
  document.querySelector('.cover-div').remove();
}

// Run like this:
// login()
// login({whyMessage:.. followLinkMessage:..})
// login({whyMessage:.. followLinkMessage:..}, callback)
module.exports = function(options, callback) {
  options = options || {};
  callback = callback || function() { };

  showCover();

  // TODO
  var container = document.getElementById('prompt-form-container');
  document.getElementById('prompt-message').innerHTML = text;
  form.elements.text.value = '';

  function complete(value) {
    hideCover();
    container.style.display = 'none';
    document.onkeydown = null;
    callback(value);
  }

  form.onsubmit = function() {
    var value = form.elements.text.value;
    if (value == '') return false; // игнорировать пустой submit

    complete(value);
    return false;
  };

  form.elements.cancel.onclick = function() {
    complete(null);
  };

  document.onkeydown = function(e) {
    e = e || event;
    if (e.keyCode == 27) { // escape
      complete(null);
    }
  };

  var lastElem = form.elements[form.elements.length-1];
  var firstElem = form.elements[0];

  lastElem.onkeydown = function(e) {
    if (e.keyCode == 9 && !e.shiftKey) {
      firstElem.focus();
      return false;
    }
  };

  firstElem.onkeydown = function(e) {
    if (e.keyCode == 9 && e.shiftKey) {
      lastElem.focus();
      return false;
    }
  };


  container.style.display = 'block';
  form.elements.text.focus();

};
