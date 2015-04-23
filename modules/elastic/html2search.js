module.exports = function prepareHtml(html) {

  // Format the source for search
  // I must do it here, not in char_filter of elastic,
  // because this text WILL BE DISPLAYED
  // (or it's part)
  //
  // if I leave html tags here => they will appear in search result

  return html
    .replace(/([^.])(<\/h\d>)/gim, '$1.$2') // make all headers sentences:   # Text -> # Text.
    // should we make "search in sources" an optional checkbox?
    .replace(/<pre class="language-[\s\S]*?<\/pre>/gim, '') // remove code
    .replace(/<pre class="line-numbers[\s\S]*?<\/pre>/gim, '') // remove code
    .replace(/<style(\s|>)[\s\S]*?<\/style>/gim, '')  // remove styles
    .replace(/<script(\s|>)[\s\S]*?<\/script>/gim, '') // remove inline scripts
    .replace(/<\/?[a-z].*?>/gim, ''); // strip all tags
};
