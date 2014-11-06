

document.addEventListener('click', function(e) {
  if (e.target.hasAttribute('data-action-user-logout')) {
    e.preventDefault();
    logout();
  }
});


function logout() {
  var form = document.createElement('form');
  form.innerHTML = '<input name="_csrf" value="' + window.csrf + '">';
  form.method = 'POST';
  form.action = '/auth/logout';
  form.submit();
}


module.exports = logout;
