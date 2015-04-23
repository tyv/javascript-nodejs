const BodyParser = require('simpledownParser').BodyParser;
const HtmlTransformer = require('simpledownParser').HtmlTransformer;
const config = require('config');

/**
 * Simple renderer for a text w/o resources
 * @param text
 * @param options
 * @returns {*}
 */
module.exports = function(text, options) {
  options = Object.create(options || {});
  if (options.trusted === undefined) {
    options.trusted = true;
  }

  if (options.applyContextTypography === undefined) {
    options.applyContextTypography = true;
  }

  const node = new BodyParser(text, options).parseAndWrap();

  const transformer = new HtmlTransformer({
    staticHost:      config.server.staticHost
  });

  var result = transformer.transform(node, options.applyContextTypography);

  // if typography is not applied, we need to strip local <no-typography> tags which prevent it
  if (!options.applyContextTypography) {
    result = result.replace(/<\/?no-typography>/g, '');
  }

  return result;

};