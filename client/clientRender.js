var bem = require('bem-jade')();
import { thumb } from 'client/image';

module.exports = function(template, locals) {
  locals = locals ? Object.create(locals) : {};
  addStandardHelpers(locals);

  return template(locals);
};

function addStandardHelpers(locals) {
  locals.bem = bem;

  locals.thumb = thumb;
}

