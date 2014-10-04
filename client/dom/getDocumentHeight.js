var scrollbarHeight = require('./getScrollbarHeight');

module.exports = function(doc) {
  doc = doc || document;
  var height = doc.documentElement.scrollHeight || doc.body.scrollHeight;

  if (doc.documentElement.scrollWidth > doc.documentElement.clientWidth) {
    // got a horiz scroll, let's add it
    height += scrollbarHeight;
  }

  return height;
};


/**  TODO: is Math.max below still needed anywhere?
 * Gets the height of the document
 * @see http://james.padolsey.com/javascript/get-document-height-cross-browser/
 * @return {int} the height of the document in pixels

function getDocumentHeight() {
  var body = document.body,
      documentElement = document.documentElement;

  return Math.max(
    body.scrollHeight, documentElement.scrollHeight,
    body.offsetHeight, documentElement.offsetHeight,
    body.clientHeight, documentElement.clientHeight
  );
}
*/


