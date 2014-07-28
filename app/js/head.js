require('./polyfill');

document.on('click', 'a', function(e) {
  alert('ok');
  e.preventDefault();
});
