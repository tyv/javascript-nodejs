
// Run like this:
// login()
// login({whyMessage:.. followLinkMessage:..})
// login({whyMessage:.. followLinkMessage:..}, callback)
module.exports = function(options, callback) {
  options = options || {};
  callback = callback || function() { };

  var authWindow = document.createElement('div');
  authWindow.className = "auth-form";

  authWindow.innerHTML = '<div class="progress large"></div>';
  document.body.append(authWindow);

  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/auth/form', true);
  xhr.onloadend = function() {
    if (this.status != 200 || !this.responseText) {
      alert("Извините, ошибка на сервере");
      return;
    }
    authWindow.innerHTML = this.responseText;
    addLoginFormEvents(authWindow.querySelector('.login-form'), callback);
  };

  xhr.send();

};

function addLoginFormEvents(form, callback) {
  form.addEventListener('submit', function(event) {
    event.preventDefault();

    var email = form.elements.email;
    var password = form.elements.password;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/auth/login/local', true);
    xhr.onloadend = function() {
      if (!this.status || this.status >= 500 || !this.responseText) {
        alert("Извините, ошибка на сервере");
        return;
      }

      alert(this.responseText);
    };
    xhr.send(new FormData(form));

  });

}
