var filters = require('jade').filters;

var renderSimpledown = require('renderSimpledown');

filters.simpledown = function (html) {
  return renderSimpledown(html, {
    trusted: true
  });
};

