const ReferenceTransformer = require('parser/referenceTransformer');
const ImgSizeTransformer = require('parser/imgSizeTransformer');
const SourceFileTransformer = require('parser/sourceFileTransformer');
const HeaderAnchorTransformer = require('parser/headerAnchorTransformer');
const BodyParser = require('javascript-parser').BodyParser;
const HeaderTag = require('javascript-parser').HeaderTag;

module.exports = function* (text, options) {

  // shift off the title header
  const node = new BodyParser(text, options).parseAndWrap();

  if (options.removeFirstHeader) {
    node.removeChild(node.getChild(0));
  }

  const referenceTransformer = new ReferenceTransformer(node);
  yield referenceTransformer.run();

  const imgSizeTransformer = new ImgSizeTransformer(node);
  yield imgSizeTransformer.run();

  const sourceFileTransformer = new SourceFileTransformer(node);
  yield sourceFileTransformer.run();

  const headerAnchorTransformer = new HeaderAnchorTransformer(node);
  yield headerAnchorTransformer.run();

  return node;
};
