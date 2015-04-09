// current page host
var baseURI = window.location.host;

document.addEventListener('click', function(e) {

  if (e.defaultPrevented) return;

  // abandon if no active link or link within domain
  var link = e.target.closest && e.target.closest("a");
  if (!link || baseURI == link.host) return;

  // cancel event and record outbound link
  e.preventDefault();
  var href = link.href;
  window.ga('send', 'event', 'outbound', 'click', href, {
    hitCallback: loadPage
  });

  // redirect after one second if recording takes too long
  setTimeout(loadPage, 500);

  // redirect to outbound page
  function loadPage() {
    document.location = href;
  }

});
