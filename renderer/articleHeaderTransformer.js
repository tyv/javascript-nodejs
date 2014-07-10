const TreeWalker = require('javascript-parser').TreeWalker;
const HeaderTag = require('javascript-parser').HeaderTag;

function ArticleHeadersTransformer(root) {
  this.root = root;
}

/*
ArticleHeadersTransformer.prototype.run = function* () {

  if (! (this.root.getChild(0) instanceof HeaderTag) ) {
    throw new Error("First node must be # Title");
  }

  this.root.removeChild(this.root.getChild(0));

  var children = this.root.getChildren() {
    // todo
  };

};


*/
