const util = require('util');
const TreeWalker = require('./treeWalker');
const ImgTag = require('javascript-parser').ImgTag;
const SourceTag = require('javascript-parser').SourceTag;
const TextNode = require('javascript-parser').TextNode;
const ErrorTag = require('javascript-parser').ErrorTag;
const mongoose = require('mongoose');
const Reference = require('tutorial/models/reference');
const Article = require('tutorial/models/article');
const Task = require('tutorial/models/task');
const path = require('path');
var thunkify = require('thunkify');
var fs = require('fs');
var fsReadFile = thunkify(fs.readFile);
const config = require('config');

function SourceFileTransformer(node) {
  this.node = node;
}

SourceFileTransformer.prototype.run = function* () {

  var treeWalker = new TreeWalker(this.node);

  var self = this;
  yield treeWalker.walk(function*(node) {
    if (!(node instanceof SourceTag)) return;

    if (!node.src) return;

    var sourcePath = path.join(config.publicPath, node.src);
    // path out of our root folder
    if (sourcePath.slice(0, config.publicPath.length + 1) != config.publicPath + '/') return;

    var content;

    try {
      content = yield fsReadFile(sourcePath, 'utf-8');
    } catch (e) {
      throw new Error("Не могу прочитать файл: " + node.src +
          (process.env.NODE_ENV == 'development' ? " [" + sourcePath + "]" : "")
      );
    }

    node.setTextFromSrc(content);
  });
};


module.exports = SourceFileTransformer;
