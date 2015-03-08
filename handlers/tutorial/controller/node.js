var path = require('path');
var url = require('url');
var fs = require('mz/fs');
var config = require('config');
var util = require('util');

function clean(pathOrPiece) {
  pathOrPiece = pathOrPiece.replace(/[^\/.a-z0-9_-]/gim, '');

  // .. -> .
  pathOrPiece = pathOrPiece.replace(/\.+/g, '.');

  //  //// -> /
  pathOrPiece = pathOrPiece.replace(/\/+/g, '/');

  return pathOrPiece;
}


exports.all = function*() {
  // bad path: http://javascript.in/task/capslock-warning-field/solution
  if (this.params.serverPath === undefined) {
    this.throw(404);
  }

  // for /article/ajax-xmlhttprequest/xhr/test: xhr/test
  var serverPath = clean(this.params.serverPath);
  var slug = clean(this.params.slug);
  var view = clean(this.params.view);
  var taskOrArticle = this.url.match(/\w+/)[0];

  var modulePath = path.join(config.publicRoot, taskOrArticle, slug, view, 'server.js');

  this.log.debug("trying modulePath", modulePath);

  if (yield fs.exists(modulePath)) {

    var server = require(modulePath);

    this.req.url = "/" + serverPath;
    this.res.statusCode = 200; // reset default koa 404 assignment
    this.log.debug("passing control to modulePath server, url=", this.req.url);
    this.respond = false;
    server.accept(this.req, this.res);
  } else {
    this.throw(404);
  }

};

/*
process.chdir(__dirname);

var accept = require('js-example').makeAccept(module);
http.createServer(function(req, res) {

  req.url = req.url.replace(/^\/files\/tutorial\/ajax\//, '/');
//  console.log(req.method, " ", req.url);
  accept(req, res);
}).listen(8080);


function makeAccept(dirModule) {


  return function(req, res) {

    process.chdir(path.dirname(dirModule.filename));

    var urlParsed = url.parse(req.url);

    // null for root requests (http://new.javascript.ru/files/tutorial/ajax/xhr)
    if (!urlParsed.pathname) urlParsed.pathname = '';

    // clean pathname
    var pathname = urlParsed.pathname.replace(/[^\/.a-z0-9_-]/gim, '');

    // .. -> .
    pathname = pathname.replace(/\.+/g, '.');

    //  //// -> /
    pathname = pathname.replace(/\/+/g, '/');

    var urlSplit = pathname.split('/');
    console.log(urlSplit);
    var moduleName = urlSplit.splice(1, 1)[0];
    urlParsed.pathname = urlSplit.join('/');

    req.url = url.format(urlParsed);
    if(req.url == "") req.url = "/";

    // find module.js or module/index.js
    var isFile;

    console.log("CWD " + process.cwd() + " look for FILE:"+moduleName)

    if (fs.existsSync(moduleName+'.js')) {
      console.log("Found " + moduleName+'.js');
      isFile = true;
    } else {

      if (!fs.existsSync(moduleName)) {
        res.writeHead(404);
        console.log("No folder or file at " + dirModule.filename);
        res.end("Not found folder or file");
        return;
      }

      if (!fs.existsSync(moduleName+'/index.js')) {
        res.writeHead(404);
        console.log("No index in module folder at " + dirModule.filename);
        res.end("Not found index in module folder");
        return;
      }

      isFile = false;
    }

    try {
      // ok, let's go for it
      if (!isFile) process.chdir('./'+moduleName);
      console.log("running " + moduleName);

      var handler = dirModule.require('./'+moduleName);

      if (!handler || !handler.accept) {
        res.writeHead(500);
        res.end("No accepting handler");
        return;
      }

      handler.accept(req, res);
    } catch(e) {
      res.writeHead(500);
      res.end(e.stack);
    }
  }

}
*/
