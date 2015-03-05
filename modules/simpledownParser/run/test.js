#! /usr/bin/env node
var BodyParser = require('..').BodyParser;
var HtmlTransformer = require('..').HtmlTransformer;

//var text = require('fs').readFileSync('/js/javascript-nodejs/javascript-tutorial/01-js/02-first-steps/01-hello-world/01-hello-alert/solution.md', 'utf-8').trim();
//text = text.substr(14);
//text = "```js\nx```";

var text = "TEST";

console.log(text);
var options = {
  staticHost: "https://js.cx",
  resourceWebRoot: '/task/hello-alert',
  metadata:                   {},
  trusted:                    true
};

var d = new Date();
var parser = new BodyParser(text, options);
var result = parser.parseAndWrap();
var transformer = new HtmlTransformer();
var result = transformer.transform(result);

console.log(result);

//console.log(result.toStructure());
