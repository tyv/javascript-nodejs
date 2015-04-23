var TagNode = require('../../node/tagNode');
var HeaderTag = require('../../node/headerTag');
var CompositeTag = require('../../node/compositeTag');
var TextNode = require('../../node/textNode');
var HtmlTransformer = require('../../transformer/htmlTransformer');

describe("HtmlTransformer", function() {

  var options = {
  };

  var makeTrusted = true;
  function node(Constructor/*, args*/) {

    if (typeof Constructor == "string") {
      return new TextNode(Constructor);
    } else {
      var args = Array.prototype.slice.call(arguments, 1);
      var node = Object.create(Constructor.prototype);
      Constructor.apply(node, args);
    }

    node.trusted = makeTrusted;
    return node;
  }

  describe("HtmlTransformer", function() {

    it("can transform text", function () {
      var input = new TextNode("text");
      new HtmlTransformer().transform(input).should.be.eql("text");
    });

    it("can transform nested", function () {
      var input = new CompositeTag('a', [
        node("Item")
      ], {'class': 'link', title: '"in quotes"'});
      input.trusted = true;
      new HtmlTransformer().transform(input).should.be.eql('<a class="link" title="&quot;in quotes&quot;">Item</a>');
    });

    it("can transform header", function () {
      var input = new HeaderTag(1, "header-italic", "text");
      input.trusted = true;
      new HtmlTransformer().transform(input).should.be.eql('<h1>text</h1>');
    });

    it("can transform more nested", function () {
      var input = new CompositeTag('div', [], {'class': 'container'});
      var ul = new CompositeTag('ul', []);
      input.appendChild(ul);
      ul.appendChildren([
        new TagNode('li', 'Item 1'),
        new CompositeTag('li', [
          new TextNode("Item "),
          new TagNode('em', 'italic', {class: 'nice'})
        ])
      ]);
      input.trusted = true;

      new HtmlTransformer().transform(input).should.be.eql('<div class="container"><ul><li>Item 1</li><li>Item <em class="nice">italic</em></li></ul></div>');
    });


  });
});
