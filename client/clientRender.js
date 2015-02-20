var bem = require('bem-jade')();
var thumb = require('client/image').thumb;

module.exports = function(template, locals) {
  locals = locals ? Object.create(locals) : {};
  addStandardHelpers(locals);

  return template(locals);
};

function addStandardHelpers(locals) {
  locals.bem = bem;

  locals.thumb = thumb;
}

