module.exports = function prepareHtml(html) {

  return html
    .replace(/([^.])(<\/h\d>)/gim, '$1.$2') // make all headers sentences:   # Text -> # Text.
    // should we make "search in sources" an optional checkbox?
    .replace(/<pre class="language-[\s\S]*?<\/pre>/gim, '') // remove code
    .replace(/<pre class="line-numbers[\s\S]*?<\/pre>/gim, '') // remove code
    .replace(/<\/?[a-z].*?>/gim, ''); // strip all tags
};
