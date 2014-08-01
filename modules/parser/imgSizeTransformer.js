const util = require('util');
const TreeWalker = require('./treeWalker');
const ImgTag = require('javascript-parser').ImgTag;
const CompositeTag = require('javascript-parser').CompositeTag;
const TextNode = require('javascript-parser').TextNode;
const ErrorTag = require('javascript-parser').ErrorTag;
const mongoose = require('mongoose');
const Reference = require('tutorial/models/reference');
const Article = require('tutorial/models/article');
const Task = require('tutorial/models/task');
const path = require('path');
var thunkify = require('thunkify');
var fs = require('fs');
var fsStat = thunkify(fs.stat);
var fsReadFile = thunkify(fs.readFile);
var gm = require('gm');
var imageSize = thunkify(require('image-size'));
const config = require('config');

function ImgSizeTransformer(node) {
  this.node = node;
}

ImgSizeTransformer.prototype.run = function* () {

  var treeWalker = new TreeWalker(this.node);

  var self = this;
  yield treeWalker.walk(function*(node) {
    if (!(node instanceof ImgTag)) return;

    if (node.attrs.width && node.attrs.height) return;

    var imagePath = path.join(config.publicPath, node.attrs.src);

    // path out of our root folder
    if (imagePath.slice(0, config.publicPath.length + 1) != config.publicPath + '/') return;

    if (!/\.(png|jpg|gif|jpeg|svg)$/i.test(imagePath)) {
      return new ErrorTag("span", "Неподдерживамое расширение, должно оканчиваться на png/jpg/gif/jpeg/svg: " + node.attrs.src);
    }

    var stat;

    try {
      stat = yield fsStat(imagePath);
    } catch (e) {
      throw new Error("Нет такого файла: " + node.attrs.src +
          (process.env.NODE_ENV == 'development' ? " [" + imagePath + "]" : "")
      );
    }

    if (!stat.isFile()) {
      throw new Error("Не файл: " + node.attrs.src);
    }

    var size;
    try {
      if (/\.svg$/i.test(this.src)) {
        var size = yield function(callback) {
          // GraphicsMagick fails with `gm identify my.svg`
          gm(imagePath).options({imageMagick: true}).identify('{"width":%w,"height":%h}', callback);
        };

        size = JSON.parse(size); // warning: no error processing
      } else {
        size = yield imageSize(imagePath);
      }

    } catch (e) {
      return new ErrorTag('div', e.message);
    }

    node.attrs.width = size.width;
    node.attrs.height = size.height;
  });
};


module.exports = ImgSizeTransformer;
