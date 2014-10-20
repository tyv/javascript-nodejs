var getScrollbarHeight = require('./getScrollbarHeight');
var scrollbarHeight;

function getDocumentHeight(doc) {
  doc = doc || document;

  var height = Math.max(
    doc.body.scrollHeight, doc.documentElement.scrollHeight,
    doc.body.offsetHeight, doc.documentElement.offsetHeight,
    doc.body.clientHeight, doc.documentElement.clientHeight
  );

  if (doc.documentElement.scrollWidth > doc.documentElement.clientWidth) {
    // got a horiz scroll, let's add it
    if (!scrollbarHeight) scrollbarHeight = getScrollbarHeight();
    height += scrollbarHeight;
  }

  return height;
};

module.exports = getDocumentHeight;

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


