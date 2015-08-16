module.exports = BbtagParser;

var t = require('i18next').t;
var StringSet = require('../util/stringSet');
var Parser = require('./parser');
var BodyParser = require('./bodyParser');
var BbtagAttrsParser = require('./bbtagAttrsParser');
var consts = require('../consts');
var inherits = require('inherits');
var _ = require('lodash');
var SourceTag = require('../node/sourceTag');
var TagNode = require('../node/tagNode');
var IframeTag = require('../node/iframeTag');
var EditTag = require('../node/editTag');
var DemoTag = require('../node/demoTag');
var CutNode = require('../node/cutNode');
var ImgTag = require('../node/imgTag');
var KeyTag = require('../node/keyTag');
var CompositeTag = require('../node/compositeTag');
var CodeTabsTag = require('../node/codeTabsTag');
var ErrorTag = require('../node/errorTag');
var VerbatimText = require('../node/verbatimText');
var TextNode = require('../node/textNode');
var ParseError = require('./parseError');
var ensureSafeUrl = require('./ensureSafeUrl');

/**
 * Parser creates node objects from general text.
 * Node attrs will *not* be checked by sanitizers, they can contain anything like `onclick=`
 * This provides maximal freedom to the parser.
 *
 * Parser knows about current trust mode, so it must make sure that these attributes are safe.
 *
 * @constructor
 */
function BbtagParser(token, options) {
  Parser.call(this, options);
  this.name = token.name;
  this.paramsString = token.attrs;
  this.body = token.body;
  this.token = token;

  this.params = this.readParamsString();
}
inherits(BbtagParser, Parser);


BbtagParser.prototype.validateOptions = function(options) {

  if (!("trusted" in options)) {
    throw new Error("Must have trusted option");
  }

};


BbtagParser.prototype.readParamsString = function() {
  var parser = new BbtagAttrsParser(this.paramsString);
  return parser.parse();
};

BbtagParser.prototype.parse = function() {

  if (consts.BBTAGS_BLOCK_SET[this.name]) {
    return this.parseBlock();
  }

  if (consts.BBTAGS_SOURCE_SET[this.name]) {
    return this.parseSource();
  }

  var methodName = 'parse' + this.name[0].toUpperCase() + this.name.slice(1);
  var method = this[methodName];

  if (!method) {
    throw new Error("Unknown bbtag: " + this.name);
  }

  try {
    if (!this.trusted && this.params.src) {
      ensureSafeUrl(this.params.src);
    }
    if (!this.trusted && this.params.href) {
      ensureSafeUrl(this.params.href);
    }

    return method.call(this);
  } catch (e) {
    if (e instanceof ParseError) {
      return new ErrorTag(e.tag, e.message);
    } else {
      throw e;
    }
  }

};

BbtagParser.prototype.parseOffline = function() {
  if (this.options.ebookType) {
    return new BodyParser(this.body, this.options).parse();
  } else {
    return new TextNode("");
  }
};


BbtagParser.prototype.parseDemo = function() {
  var src = this.params.src;
  if (src) {
    if (~src.indexOf('://')) {
      // absolute (service) url is ok
      throw new ParseError("protocol not allowed");
    }
  }

  return new DemoTag(this.body, {src: this.params.src});
};


BbtagParser.prototype.parseHead = function() {
  if (this.trusted) {
    if (!this.options.metadata.head) this.options.metadata.head = [];

    this.options.metadata.head.push(this.body);
  }
  return new TextNode('');
};

// use object for libs, because they are
// (1) unique
// (2) keep order
BbtagParser.prototype.parseLibs = function() {
  if (this.trusted) {
    var lines = this.body.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var lib = lines[i].trim();
      if (!lib) continue;
      if (!this.options.metadata.libs) this.options.metadata.libs = new StringSet();
      this.options.metadata.libs.add(lib);
    }
  }
  return new TextNode('');
};

BbtagParser.prototype.parseImportance = function() {
  if (this.trusted) {
    this.options.metadata.importance = parseInt(this.paramsString);
  }
  return new TextNode('');
};

BbtagParser.prototype.parseEdit = function() {
  var src = this.params.src;
  if (!src) {
    this.paramRequiredError('div', 'src');
  }

  if (src[0] == '/' || ~src.indexOf('://')) {
    throw new ParseError("src must be relative, protocol not allowed");
  }

  return new EditTag(this.body, {src: this.params.src});
};

BbtagParser.prototype.parseCut = function() {
  return new CutNode();
};

BbtagParser.prototype.parseKey = function() {
  return new KeyTag(this.paramsString.trim());
};


BbtagParser.prototype.parseBlock = function() {
  var content = [];

  content.push('<div class="important__header">');
  if (this.params.header) {
    content.push('<span class="important__type"></span><div class="important__title">');
    var headerContent = new BodyParser(this.params.header, this.options).parse();
    content.push.apply(content, headerContent);
    content.push('</div>');
  } else {
    content.push('<span class="important__type">', t(consts.BBTAG_BLOCK_DEFAULT_TITLE[this.name]), '</span>');
  }

  content.push('</div>'); // ../important__header

  content.push('<div class="important__content">');
  content.push.apply(content, new BodyParser(this.body, this.options).parse());
  content.push('</div>');

  content = content.map(function(item) {
    return (typeof item == 'string') ? new TextNode(item) : item;
  }, this);

  return new CompositeTag('div', content, {'class': 'important important_' + this.name});
};


BbtagParser.prototype.parseSource = function() {
  var src = this.params.src;
  if (src) {
    if (src[0] == '/' || ~src.indexOf('://')) {
      throw new ParseError("src must be relative, protocol not allowed");
    }
  }

  var attrs = this.trusted ? _.clone(this.params) : _.pick(this.params, ['src', 'run', 'height', 'autorun']);

  // src => body is ignored
  return new SourceTag(this.name, src ? '' : this.body, attrs);
};


BbtagParser.prototype.parseSummary = function() {
  var summary = new BodyParser(this.body, this.options).parse();

  var content = new CompositeTag('div', summary, {'class': "summary__content"});

  return new CompositeTag('div', [content], {'class': 'summary'});
};

BbtagParser.prototype.parseIframe = function() {
  var src = this.params.src;

  if (!src) {
    this.paramRequiredError('div', 'src');
  }

  if (~src.indexOf('://') && !this.trusted) {
    throw new ParseError("protocol not allowed");
  }

  return new IframeTag(this.params);
};

BbtagParser.prototype.parseQuote = function() {
  var children = new BodyParser('<div class="quote__i"><p class="quote__text">' + this.body + '</p></div>', this.options).parse();

  if (this.params.author) {
    children.push(new CompositeTag('footer', [
        new TagNode('cite', this.params.author, { "class": "quote__author" })
      ], { "class": "quote__footer" }));
  }

  return new CompositeTag('blockquote', children, { "class": "quote" });
};

BbtagParser.prototype.parseHide = function() {
  var content = new BodyParser(this.body, this.options).parse();

  var children = [
    new CompositeTag('div', content, {"class": "hide-content"})
  ];

  if (this.params.text) {
    var text = new BodyParser(this.params.text, this.options).parse();

    /*jshint scripturl:true*/
    children.unshift(new CompositeTag('a', text, {"class": "hide-link", "href": "javascript:;"}));
  }

  return new CompositeTag('div', children, {"class": "hide-close"});
};

BbtagParser.prototype.parsePre = function() {
  return new VerbatimText(this.body, this.params['no-typography']);
};

BbtagParser.prototype.parseCompare = function() {
  var pros = new CompositeTag('ul', [], {"class": "balance__list"});
  var cons = new CompositeTag('ul', [], {"class": "balance__list"});

  var parts = this.body.split(/\n+/);

  for (var i = 0; i < parts.length; i++) {
    var item = parts[i];
    if (!item) continue;
    var content = new BodyParser(item.slice(1), this.options).parse();
    if (item[0] == '+') {
      pros.appendChild(new CompositeTag('li', content, {'class': 'balance__list-item'}));
    } else if (item[0] == '-') {
      cons.appendChild(new CompositeTag('li', content, {'class': 'balance__list-item'}));
    } else {
      throw new ParseError('div', 'compare items should start with either + or -');
    }
  }

  var hasBothParts = pros.hasChildren() && cons.hasChildren();

  if (hasBothParts) {
    pros.prependChild(new TagNode('div', 'Достоинства', {'class': 'balance__title'}));
    cons.prependChild(new TagNode('div', 'Недостатки', {'class': 'balance__title'}));
  }


  var balance = new CompositeTag('div', [], {
    'class': 'balance' + (cons.hasChildren() && pros.hasChildren() ? '' : ' balance_single')
  });

  if (pros.hasChildren()) {
    balance.appendChild(new CompositeTag('div', [
      new CompositeTag('div', [pros], {'class': 'balance__content'})
    ], {'class': 'balance__pluses'}));
  }

  if (cons.hasChildren()) {
    balance.appendChild(new CompositeTag('div', [
      new CompositeTag('div', [cons], {'class': 'balance__content'})
    ], {'class': 'balance__minuses'}));
  }

  return balance;

};

BbtagParser.prototype.parseOnline = function() {
  if (!this.options.ebookType) {
    var parser = new BodyParser(this.body, this.options);
    return parser.parse();
  } else {
    return new TextNode("");
  }
};

BbtagParser.prototype.paramRequiredError = function(errorTag, paramName) {
  throw new ParseError(errorTag, this.name + ": attribute required " + paramName);
};

BbtagParser.prototype.parseImg = function() {
  if (!this.params.src) {
    this.paramRequiredError('div', 'src');
  }

  var attrs = this.trusted ? _.clone(this.params) : _.pick(this.params, ['src', 'width', 'height', 'alt']);

  return new ImgTag(attrs, this.token.isFigure);
};


BbtagParser.prototype.parseCodetabs = function() {
  var src = this.params.src;
  if (!src) {
    this.paramRequiredError('div', 'src');
  }

  if (src[0] == '/' || ~src.indexOf('://')) {
    throw new ParseError("src must be relative, protocol not allowed");
  }

  return new CodeTabsTag(this.params);
};

