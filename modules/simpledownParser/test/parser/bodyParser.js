var BodyParser = require('../../parser/bodyParser');
var path = require('path');
var should = require('should');
var util = require('util');

function toStructure(nodes) {
  return nodes.map(function(node) {
    return node.toStructure({skipTrusted: true});
  });
}

describe("BodyParser", function() {

  var options = {
    staticHost:      'https://js.cx',
    resourceWebRoot: '/data',
    trusted:         true,
    metadata:        {}
  };

  describe('parse', function() {

    it("*italic* text", function() {
      var parser = new BodyParser(this.test.title, options);
      var result = parser.parse();
      var structure = toStructure(result);
      structure.should.be.eql([
          {
            type:     'CompositeTag',
            tag:      'em',
            children: [
              {type: 'TextNode', text: 'italic'}
            ]
          },
          {
            type: 'TextNode',
            text: ' text'
          }
        ]
      );
    });

    it("<img src='html6.jpg'> test", function() {
      var parser = new BodyParser(this.test.title, options);
      var result = parser.parse();
      var structure = toStructure(result);
      structure.should.be.eql([
        {
          type:  'ImgTag',
          text:  '',
          tag:   'img',
          attrs: {alt: 'html6.jpg', src: 'html6.jpg'}
        },
        {type: 'TextNode', text: ' test'}
      ]);
    });

    it("[online] text *in* [/online] out", function() {
      var parser = new BodyParser(this.test.title, options);
      var result = parser.parse();

      toStructure(result).should.be.eql([
          {type: 'TextNode', text: ' text '},
          {
            type:     'CompositeTag',
            tag:      'em',
            children: [
              {type: 'TextNode', text: 'in'}
            ]
          },
          {type: 'TextNode', text: ' '},
          {type: 'TextNode', text: ' out'}
        ]
      );
    });

    it("[js]my code;[css][/css]my code;[/js]", function() {
      var parser = new BodyParser(this.test.title, options);
      var result = parser.parse();
      toStructure(result).should.be.eql([
        {
          type: 'SourceTag',
          text: 'my code;[css][/css]my code;',
          tag:  'pre'
        }
      ]);
    });

    it("# Header *has* no `markup`", function() {
      var parser = new BodyParser(this.test.title, options);
      var result = parser.parse();

      toStructure(result).should.be.eql([
        {
          type: 'HeaderTag',
          text: 'Header *has* no `markup`'
        }
      ]);
    });

    it("# Header\n\n Content", function() {
      var parser = new BodyParser(this.test.title, options);
      var result = parser.parse();

      toStructure(result).should.be.eql([
        {
          type: 'HeaderTag',
          text: "Header"
        },
        {type: 'TextNode', text: '\n\n Content'}
      ]);
    });

    it("[compare]+Plus 1\n-Minus *italic*\n[/compare]", function() {
      var parser = new BodyParser(this.test.title, options);
      var result = parser.parse();

      toStructure(result).should.be.eql([{
        type:     'CompositeTag',
        tag:      'div',
        attrs:    {class: 'balance'},
        children: [{
          type:     'CompositeTag',
          tag:      'div',
          attrs:    {class: 'balance__pluses'},
          children: [{
            type:     'CompositeTag',
            tag:      'div',
            attrs:    {class: 'balance__content'},
            children: [{
              type:     'CompositeTag',
              tag:      'ul',
              attrs:    {class: 'balance__list'},
              children: [{
                type:  'TagNode',
                text:  'Достоинства',
                tag:   'div',
                attrs: {class: 'balance__title'}
              },
                {
                  type:     'CompositeTag',
                  tag:      'li',
                  attrs:    {class: 'balance__list-item'},
                  children: [{type: 'TextNode', text: 'Plus 1'}]
                }]
            }]
          }]
        },
          {
            type:     'CompositeTag',
            tag:      'div',
            attrs:    {class: 'balance__minuses'},
            children: [{
              type:     'CompositeTag',
              tag:      'div',
              attrs:    {class: 'balance__content'},
              children: [{
                type:     'CompositeTag',
                tag:      'ul',
                attrs:    {class: 'balance__list'},
                children: [{
                  type:  'TagNode',
                  text:  'Недостатки',
                  tag:   'div',
                  attrs: {class: 'balance__title'}
                },
                  {
                    type:     'CompositeTag',
                    tag:      'li',
                    attrs:    {class: 'balance__list-item'},
                    children: [{type: 'TextNode', text: 'Minus '},
                      {
                        type:     'CompositeTag',
                        tag:      'em',
                        children: [{type: 'TextNode', text: 'italic'}]
                      }]
                  }]
              }]
            }]
          }]
      }]);
    });

  });

});
