var NO_WRAP_TAGS_SET = require('../consts').NO_WRAP_TAGS_SET;
var sanitize = require('../util/sanitize');
var charTypography = require('../typography/charTypography');
var contextTypography = require('../typography/contextTypography');
var escapeHtmlText = require('textUtil/escapeHtmlText');
var escapeHtmlAttr = require('textUtil/escapeHtmlAttr');
var stripIndents = require('../util/source/stripIndents');
var TextNode = require('simpledownParser').TextNode;
var extractHighlight = require('../util/source/extractHighlight');

var iframeBoxTemplate = require('./iframeBox.jade');
var codeBoxTemplate = require('./codeBox.jade');

function HtmlTransformer(options) {
  options = options || {};
  this.options = options;
  this.resourceWebRoot = options.resourceWebRoot;
  this.staticHost = options.staticHost;
  this.linkHeaderTag = options.linkHeaderTag;
}

HtmlTransformer.prototype.transform = function(node, isFinal) {
  var method = 'transform' + node.getType();

  if (!this[method]) {
    throw new Error("Unsupported node type: " + node.getType());
  }

  var html = this[method](node);

  if (isFinal) {
    html = this.finalize(html);
  }
  return html;
};

HtmlTransformer.prototype.finalize = function(html) {
  return contextTypography(html);
};

HtmlTransformer.prototype.formatHtml = function(html, trusted) {
  if (trusted === undefined) {
    throw new Error("formatHtml needs to know trusted");
  }

  html = charTypography(html);

  if (!trusted) {
    html = sanitize(html);
  }

  return html;
};

HtmlTransformer.prototype.attrsToString = function(attrs) {
  var result = [];
  for (var name in attrs) {
    name = escapeHtmlAttr(name);
    var value = escapeHtmlAttr(attrs[name]);
    result.push(name + '="' + value + '"');
  }

  return result.join(' ');
};

HtmlTransformer.prototype.wrapTagAround = function(tag, attrs, html) {
  attrs = this.attrsToString(attrs);
  var result = "<" + tag + (attrs ? (' ' + attrs) : '') + '>';

  if (tag != 'img') {
    result += html + '</' + tag + '>';
  }
  return result;
};


HtmlTransformer.prototype.transformCommentNode = function(node) {
  return "<!--" + node.text + "-->";
};

HtmlTransformer.prototype.replaceHtmlWithLabel = function(tag, html, labels) {
  var label = this.makeLabel();
  labels[label] = html;
  if (NO_WRAP_TAGS_SET[tag]) {
    return "<div>LABEL:" + label + "</div>";
  } else {
    return "<span>LABEL:" + label + "</span>";
  }
};

HtmlTransformer.prototype.transformCompositeTag = function(node) {
  var labels = {};
  var html = '';

  var children = node.getChildren();

  for (var i = 0; i < children.length; i++) {
    var child = children[i];

    var childHtml = this.transform(child);

    if (child.getType() != 'TextNode') {
      childHtml = this.replaceHtmlWithLabel(child.tag, childHtml, labels);
    }

    html += childHtml;
  }

  node.ensureKnowTrusted();

  html = this.formatHtml(html, node.isTrusted());

  html = this.replaceLabels(html, labels);

  if (node.tag) {
    html = this.wrapTagAround(node.tag, node.attrs, html);
  }

  return html;
};


HtmlTransformer.prototype.transformCommentNode = function(node) {
  return "<!--" + node.text + "-->";
};


HtmlTransformer.prototype.transformCutNode = function(node) {
  return "";
};

HtmlTransformer.prototype.transformErrorTag = function(node) {
  return this.transformTagNode(node);
};

HtmlTransformer.prototype.transformEscapedTag = function(node) {
  var html = escapeHtmlText(node.text);
  html = this.wrapTagAround(node.tag, node.attrs, html);
  return html;
};

HtmlTransformer.prototype.transformHeaderTag = function(node) {
  var headerContent = this.transformVerbatimText(node);
  return '<h' + node.level + '>' + headerContent + '</h' + node.level + '>';
};

HtmlTransformer.prototype.transformImgTag = function(node) {
  var html;

  if (node.isFigure) {
    var attrs = Object.create(node.attrs);
    attrs['class'] = attrs['class'] ? attrs['class'] + ' image__image' : 'image__image';

    if (node.attrs.width && node.attrs.height) {
      html = '<figure><div class="image" style="width: ' + node.attrs.width + 'px;">' +
      '<div class="image__ratio" style="padding-top: ' + (node.attrs.height / node.attrs.width * 100) + '%"></div>' +
      this.wrapTagAround('img', attrs) +
      '</div></figure>';
    } else {
      html = '<figure>' + this.transformTagNode(node) + '</figure>';
    }

  } else {
    html = this.transformTagNode(node);
  }

  return html;
};

HtmlTransformer.prototype.transformKeyTag = function(node) {

  var results = [];
  var keys = node.text;

  if (keys == "+") {
    return this.wrapTagAround(node.tag, node.attrs, '+');
  }

  var plusLabel = Math.random();
  keys = keys.replace(/\+\+/g, '+' + plusLabel);
  keys = keys.split('+');

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    results.push((key == plusLabel) ? '+' : key);
    if (i < keys.length - 1) {
      results.push('<span class="shortcut__plus">+</span>');
    }
  }

  return this.wrapTagAround(node.tag, node.attrs, results.join(''));
};

HtmlTransformer.prototype.transformNode = function(node) {
  throw new Error("Basic node should not be instantiated and used");
};


HtmlTransformer.prototype.transformLinkTag = function(node) {
  // relative links are static
  if (!~node.attrs.href.indexOf('://') && node.attrs.href[0] != '/') {
    node.attrs.href = this.staticHost + this.resourceWebRoot + '/' + node.attrs.href;
  }

  // [](http://site.com)
  if (!node.getChildren().length) {
    node.appendChild(new TextNode(node.attrs.href));
  }

  return this.transformCompositeTag(node);
};

// on this stage the tag either contains this.src OR the resolved text
HtmlTransformer.prototype.transformCodeTabsTag = function(node) {
  var text = 'Пример ' + node.attrs.src;

  return this.wrapTagAround('div', {}, text);
};

// on this stage the tag either contains this.src OR the resolved text
HtmlTransformer.prototype.transformSourceTag = function(node) {

  node.ensureKnowTrusted();

  var text = (node.attrs.src && !node.text) ? ('Содержимое файла ' + node.attrs.src) : node.text;

  var prismLanguageMap = {
    html:   'markup',
    js:     'javascript',
    coffee: 'coffeescript'
  };

  var prismLanguage = prismLanguageMap[node.name] || node.name;

  var locals = {
    language: prismLanguage
  };

  var renderTrusted = (node.isTrusted() && !node.attrs.untrusted) ? 1 : false;

  var attrs = locals.attrs = {
    "data-trusted": renderTrusted
  };

  // demo height of
  if (node.attrs.height) {
    var height = parseInt(node.attrs.height);
    if (!node.isTrusted()) height = Math.max(height, 800);
    attrs['data-demo-height'] = height;
  }

  if (node.attrs.autorun) {
    attrs['data-autorun'] = '1';
  }
  if (node.attrs.refresh) {
    attrs['data-refresh'] = '1';
  }

  locals.run = node.attrs.run;

  if (node.attrs.demo) {
    attrs['data-demo'] = '1';
  }

  // strip first empty lines
  text = stripIndents(text);

  var highlight = extractHighlight(text);

  if (highlight.block) {
    attrs['data-highlight-block'] = highlight.block;
  }
  if (highlight.inline) {
    attrs['data-highlight-inline'] = highlight.inline;
  }
  text = highlight.text;

  locals.text = text;

  return this.wrapTagAround('no-typography', {}, codeBoxTemplate(locals));
};

HtmlTransformer.prototype.transformTagNode = function(node) {
  var html = this.formatHtml(node.text, node.isTrusted());
  html = this.wrapTagAround(node.tag, node.attrs, html);
  return html;
};

HtmlTransformer.prototype.transformTextNode = function(node) {
  return node.text;
};

HtmlTransformer.prototype.transformEditTag = function(node) {

  var text = node.text;
  if (!text) {
    if (node.attrs.task) {
      text = 'Открыть исходный документ';
    } else {
      text = 'Открыть в песочнице';
    }
  }

  var html = this.formatHtml(text, node.isTrusted());

  var attrs = {
    "class": "edit",
    href:    "/play/" + node.attrs.src
  };

  return this.wrapTagAround('a', attrs, html);

};


HtmlTransformer.prototype.transformDemoTag = function(node) {

  var attrs = {};

  if (node.attrs.src) {
    attrs.href = node.attrs.src[0] == '/' ? node.attrs.src : this.staticHost + this.resourceWebRoot + '/' + node.attrs.src;
    attrs.href += '/';
    attrs.target = '_blank';
    return this.wrapTagAround('a', attrs, 'Демо в новом окне');
  }

  return this.wrapTagAround('button', {"onclick": 'runDemo(this)'}, "Запустить демо");

};

HtmlTransformer.prototype.transformVerbatimText = function(node) {
  node.ensureKnowTrusted();

  var html = node.text;
  if (!node.isTrusted()) {
    html = sanitize(html);
  }
  return html;
};

HtmlTransformer.prototype.transformIframeTag = function(node) {

  var locals = {
    'data-trusted': node.isTrusted() ? 1 : false,
    attrs:          {}
  };

  var height = parseInt(node.attrs.height) || 300;
  if (!node.isTrusted()) height = Math.max(height, 800);
  locals.attrs.style = 'height: ' + height + 'px';

  var src = node.attrs.src;

  // relative url w/o domain means we want static host
  //    [iframe src="dir"]
  // otherwise we want a dynamic service e.g
  //    [iframe src="/ajax/service"]
  if (src[0] != '/' && !~src.indexOf('://')) {
    src = this.staticHost + this.resourceWebRoot + '/' + src;
  }

  locals.attrs.src = src + '/';

  if (node.attrs.plunkId) {
    locals.edit = {
      href:    'http://plnkr.co/edit/' + node.attrs.plunkId + '?p=preview',
      plunkId: node.attrs.plunkId
    };
  }

  if (node.attrs.link) {
    locals.link = {
      href: locals.attrs.src
    };
  }

  if (node.attrs.zip) {
    locals.zip = {
      href: '/zip' + locals.attrs.src
    };
  }


  var rendered = iframeBoxTemplate(locals);
  return this.wrapTagAround('no-typography', {}, rendered);

};


HtmlTransformer.prototype.makeLabel = function() {
  return Math.random().toString(36).slice(2);
};

HtmlTransformer.prototype.replaceLabels = function(html, labels) {
  var pattern = /<span>LABEL:(\w+)<\/span>|<div>LABEL:(\w+)<\/div>/g;

  return html.replace(pattern, function(match, p1, p2) {
    var label = p1 || p2;
    var content = labels[label];
    delete labels[label];
    return content;
  });
};


module.exports = HtmlTransformer;
