var escapeHtmlText = require('textUtil/escapeHtmlText');

module.exports = function renderParagraphsAndLinks(text) {
  if (!text) return '';

  text = escapeHtmlText(text);

  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(str, p1, p2) {
    return formatLink(p2, p1);
  });

  text = text.replace(/https?:\/\/(?:[\w\d-]+\.?)+(?:\/[\w\d-]*)?/g, function(str, pos) {
    if (text[pos-1] == '"') return str; // quoted href
    return formatLink(str, str);
  });

  text = text.replace(/\n\s*\n/g, '</p><p>');

  return '<p>' + text + '</p>';
};

function formatLink(href, text) {
  if (naughtyHref(href)) return "";

  href = href.replace(/"/g, "&quot;");

  return `<a href="${href}">${text}</a>`;
}

// from sanitize-html
function naughtyHref(href) {
  // Browsers ignore character codes of 32 (space) and below in a surprising
  // number of situations. Start reading here:
  // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet#Embedded_tab
  href = href.replace(/[\x00-\x20]+/g, '');
  // Clobber any comments in URLs, which the browser might
  // interpret inside an XML data island, allowing
  // a javascript: URL to be snuck through
  href = href.replace(/<\!\-\-.*?\-\-\>/g, '');
  // Case insensitive so we don't get faked out by JAVASCRIPT #1
  var matches = href.match(/^([a-zA-Z]+)\:/);
  if (!matches) {
    // No scheme = no way to inject js (right?)
    return false;
  }

  var scheme = matches[1].toLowerCase();

  if (scheme != 'http' && scheme != 'https' && scheme != 'mailto' ) return true;

  return false;
}
