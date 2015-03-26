// current page host
var baseURI = window.location.host;

document.addEventListener('click', function(e) {

  if (e.isDefaultPrevented()) return;

  // abandon if no active link or link within domain
  var link = e.target.closest("a");
  if (!link || baseURI == link.host) return;

  // cancel event and record outbound link
  e.preventDefault();
  var href = link.href;
  window.ga('send', {
    'hitType': 'event',
    'eventCategory': 'outbound',
    'eventAction': 'link',
    'eventLabel': href,
    'hitCallback': loadPage
  });

  // redirect after one second if recording takes too long
  setTimeout(loadPage, 1000);

  // redirect to outbound page
  function loadPage() {
    document.location = href;
  }

});
