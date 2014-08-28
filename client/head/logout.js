var init = require('./init');

init.addHandler("logout", function() {

  var button = document.querySelector('.sitetoolbar__logout');
  button.onclick = function(e) {
    e.preventDefault();
    logout();
  };
  button.classList.remove('unready');
});


function logout() {
  var form = document.createElement('form');
  form.innerHTML = '<input name="_csrf" value="' + window.csrf + '">';
  form.method = 'POST';
  form.action = '/auth/logout';
  form.submit();
}


module.exports = logout;
