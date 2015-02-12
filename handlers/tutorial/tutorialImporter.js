const co = require('co');
const util = require('util');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const config = require('config');
const mongoose = require('lib/mongoose');
const glob = require("glob");

require('lib/requireJade');

const Article = require('tutorial').Article;
const Reference = require('tutorial').Reference;
const Plunk = require('plunk').Plunk;
const Task = require('tutorial').Task;
const ArticleRenderer = require('./renderer/articleRenderer');
const TaskRenderer = require('./renderer/taskRenderer');
const BodyParser = require('simpledownParser').BodyParser;
const TreeWalkerSync = require('simpledownParser').TreeWalkerSync;
const HeaderTag = require('simpledownParser').HeaderTag;
const log = require('log')();

const execSync = require('child_process').execSync;

// TODO: use htmlhint/jslint for html/js examples

function TutorialImporter(options) {
  this.root = fs.realpathSync(options.root);
  this.onchange = options.onchange || function() {
  };
}

TutorialImporter.prototype.sync = function* (directory) {

  log.info("sync", directory);
  var dir = fs.realpathSync(directory);
  var type;
  while (true) {
    if (fs.existsSync(path.join(dir, 'index.md'))) {
      type = 'Folder';
      break;
    }
    if (fs.existsSync(path.join(dir, 'article.md'))) {
      type = 'Article';
      break;
    }
    if (fs.existsSync(path.join(dir, 'task.md'))) {
      type = 'Task';
      break;
    }

    dir = path.dirname(dir);

    if (directory == this.root || directory == '/') {
      throw new Error("Unknown directory type: " + directory);
    }
  }

  var parentDir = path.dirname(dir);

  var parentSlug = path.basename(parentDir);
  parentSlug = parentSlug.slice(parentSlug.indexOf('-') + 1);

  var parent = yield Article.findOne({slug: parentSlug}).exec();

  yield* this['sync' + type](dir, parent);

};

/**
 * Call this after all import is complete to generate caches/searches for ElasticSearch to consume
 */
TutorialImporter.prototype.generateCaches = function*() {
  var articles = yield Article.find({}).exec();

  for (var i = 0; i < articles.length; i++) {
    var article = articles[i];
    yield* (new ArticleRenderer()).renderWithCache(article);
  }

  var tasks = yield Task.find({}).exec();

  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];
    yield* (new TaskRenderer()).renderWithCache(task);
  }
};

TutorialImporter.prototype.extractHeader = function(parsed) {
  log.debug("extracting header");

  const titleHeader = parsed.getChild(0);
  if (titleHeader.getType() != 'HeaderTag') {
    throw new Error("must start with a #Header");
  }

  return titleHeader.text; // no more ugly code in headers
};


// todo with incremental import: move to separate task?
TutorialImporter.prototype.checkIfErrorsInParsed = function(parsed) {
  log.debug("checking errors in parsed");
  const walker = new TreeWalkerSync(parsed);
  const errors = [];

  walker.walk(function(node) {
    if (node.getType() == 'ErrorTag') {
      errors.push(node.text);
    }
  });
  if (errors.length) {
    throw new Error("Errors: " + errors.join());
  }
};


TutorialImporter.prototype.destroyAll = function* () {
  yield Article.destroy({});
  yield Task.destroy({});
  yield Reference.destroy({});
};

TutorialImporter.prototype.syncFigures = function*(figuresFilePath) {

  if (!fs.existsSync('/usr/local/bin/sketchtool')) {
    log.info("No sketchtool");
    return;
  }

  var outputDir = path.join(config.tmpRoot, 'sketchtool');

  fse.removeSync(outputDir);
  fse.mkdirsSync(outputDir);

  var artboardsByPages = JSON.parse(execSync('/usr/local/bin/sketchtool list artboards "' + figuresFilePath + '"', {
    encoding: 'utf-8'
  }));

  // artboardsByPages
  // [
  //    { pages: [...] ...},
  //    { pages: [...] ...},
  //    { pages: [...] ...}
  // ]
  var artboards = artboardsByPages
    .pages
    .reduce(function(prev, current) {
      return prev.concat(current.artboards);
    }, []);

  var svgIds = [];
  var pngIds = [];
  var artboardsExported = [];

  for (var i = 0; i < artboards.length; i++) {
    var artboard = artboards[i];

    // only allow artboards with extensions are exported
    // others are temporary / helpers
    var ext = path.extname(artboard.name).slice(1);
    if (ext == 'png') {
      pngIds.push(artboard.id);
      artboardsExported.push(artboard);
    }
    if (ext == 'svg') {
      svgIds.push(artboard.id);
      artboardsExported.push(artboard);
    }
  }

  // NB: Artboards are NOT trimmed (sketchtool doesn't do that yet)
  execSync('/usr/local/bin/sketchtool export artboards "' + figuresFilePath + '" ' +
  '--overwriting=YES --trimmed=YES --formats=png --scales=1,2 --output="' + outputDir + '" --items=' + pngIds.join(','), {
    stdio: 'inherit',
    encoding: 'utf-8'
  });

  // NB: Artboards are NOT trimmed (sketchtool doesn't do that yet)
  execSync('/usr/local/bin/sketchtool export artboards "' + figuresFilePath + '" ' +
  '--overwriting=YES --trimmed=YES --formats=svg --output="' + outputDir + '" --items=' + svgIds.join(','), {
    stdio: 'inherit',
    encoding: 'utf-8'
  });

  // files are exported as array-pop.svg.svg, metric-css.png@2x.png
  // => remove first extension
  var images = glob.sync(path.join(outputDir, '*.*'));
  images.forEach(function(image) {
    fs.renameSync(image, image.replace(/.(svg|png)/, ''));
  });

  var allFigureFilePaths = glob.sync(path.join(this.root, '**/*.{png,svg}'));

  function findArtboardPath(artboard) {

    for (var j = 0; j < allFigureFilePaths.length; j++) {
      if (path.basename(allFigureFilePaths[j]) == artboard.name) {
        return path.dirname(allFigureFilePaths[j]);
      }
    }

  }

  // copy should trigger folder resync on watch
  // and that's right (img size changed, <img> must be rerendered)

  for (var i = 0; i < artboardsExported.length; i++) {
    var artboard = artboardsExported[i];
    var artboardPath = findArtboardPath(artboard);
    if (!artboardPath) {
      log.error("Artboard path not found " + artboard.name);
      continue;
    }


    log.info("syncFigure move " + artboard.name + " -> " + artboardPath);
    fse.copySync(path.join(outputDir, artboard.name), path.join(artboardPath, artboard.name));
    if (path.extname(artboard.name) == '.png') {
      var x2Name = artboard.name.replace('.png', '@2x.png');
      fse.copySync(path.join(outputDir, x2Name), path.join(artboardPath, x2Name));
    }

  }


};

TutorialImporter.prototype.syncFolder = function*(sourceFolderPath, parent) {
  log.info("syncFolder", sourceFolderPath);

  const contentPath = path.join(sourceFolderPath, 'index.md');
  const content = fs.readFileSync(contentPath, 'utf-8').trim();

  const folderFileName = path.basename(sourceFolderPath);

  const data = {
    isFolder: true,
    content:  content
  };

  if (parent) {
    data.parent = parent._id;
  }

  data.weight = parseInt(folderFileName);
  data.slug = folderFileName.slice(String(data.weight).length + 1);

  yield Article.destroyTree({slug: data.slug});

  var options = {
    staticHost:      config.server.staticHost,
    resourceWebRoot: Article.getResourceWebRootBySlug(data.slug),
    metadata:        {},
    trusted:         true
  };

  const parsed = new BodyParser(content, options).parseAndWrap();

  this.checkIfErrorsInParsed(parsed);
  data.title = this.extractHeader(parsed);

  const folder = new Article(data);
  yield folder.persist();

  const subPaths = fs.readdirSync(sourceFolderPath);

  for (var i = 0; i < subPaths.length; i++) {
    if (subPaths[i] == 'index.md') continue;

    var subPath = path.join(sourceFolderPath, subPaths[i]);

    if (fs.existsSync(path.join(subPath, 'index.md'))) {
      yield* this.syncFolder(subPath, folder);
    } else if (fs.existsSync(path.join(subPath, 'article.md'))) {
      yield* this.syncArticle(subPath, folder);
    } else {
      yield* this.syncResource(subPath, folder.getResourceFsRoot());
    }
  }

  this.onchange(folder.getUrl());

};

TutorialImporter.prototype.syncArticle = function* (articlePath, parent) {
  log.info("syncArticle", articlePath);

  const contentPath = path.join(articlePath, 'article.md');
  const content = fs.readFileSync(contentPath, 'utf-8').trim();

  const articlePathName = path.basename(articlePath);

  const data = {
    content:  content,
    isFolder: false
  };

  if (parent) {
    data.parent = parent._id;
  }

  data.weight = parseInt(articlePathName);
  data.slug = articlePathName.slice(String(data.weight).length + 1);

  yield Article.destroyTree({slug: data.slug});

  const options = {
    staticHost:      config.server.staticHost,
    resourceWebRoot: Article.getResourceWebRootBySlug(data.slug),
    metadata:        {},
    trusted:         true
  };

  const parsed = new BodyParser(content, options).parseAndWrap();

  this.checkIfErrorsInParsed(parsed);
  data.title = this.extractHeader(parsed);


  // todo: updating:
  // first check if references are unique,
  // -> fail w/o deleting old article if not unique,
  // delete old article & insert the new one & insert refs
  const article = new Article(data);
  yield article.persist();

  const refs = options.metadata.refs.toArray();
  const refThunks = refs.map(function(anchor) {
    return new Reference({anchor: anchor, article: article._id}).persist();
  });

  try {
    // save all references in parallel
    yield refThunks;
  } catch (e) {
    // something went wrong => we don't need an unfinished article
    yield article.destroy(); // will kill it's refs too
    throw e;
  }


  const subPaths = fs.readdirSync(articlePath);

  for (var i = 0; i < subPaths.length; i++) {
    if (subPaths[i] == 'article.md') continue;

    var subPath = path.join(articlePath, subPaths[i]);


    if (fs.existsSync(path.join(subPath, 'task.md'))) {
      yield* this.syncTask(subPath, article);
    } else if (subPath.endsWith('.view')) {
      yield* this.syncView(subPath, article);
    } else {
      // resources
      yield* this.syncResource(subPath, article.getResourceFsRoot());
    }

  }

  this.onchange(article.getUrl());

};


TutorialImporter.prototype.syncResource = function*(sourcePath, destDir) {
  fse.ensureDirSync(destDir);

  log.info("syncResource", sourcePath, destDir);

  const stat = fs.statSync(sourcePath);
  const ext = getFileExt(sourcePath);
  const destPath = path.join(destDir, path.basename(sourcePath));

  if (stat.isFile()) {
    if (ext == 'png' || ext == 'jpg' || ext == 'gif' || ext == 'svg') {
      yield* importImage(sourcePath, destDir);
      return;
    }
    copySync(sourcePath, destPath);
  } else if (stat.isDirectory()) {
    fse.ensureDirSync(destPath);
    const subPathNames = fs.readdirSync(sourcePath);
    for (var i = 0; i < subPathNames.length; i++) {
      var subPath = path.join(sourcePath, subPathNames[i]);
      yield* this.syncResource(subPath, destPath);
    }

  } else {
    throw new Error("Unsupported file type at " + sourcePath);
  }

};

function getFileExt(filePath) {
  var ext = filePath.match(/\.([^.]+)$/);
  return ext && ext[1];
}

function* importImage(srcPath, dstDir) {
  log.info("importImage", srcPath, "to", dstDir);
  const filename = path.basename(srcPath);
  const dstPath = path.join(dstDir, filename);

  if (checkSameSizeFiles(srcPath, dstPath)) {
    return; // copySync does the check, but here I skip retina resize too
  }

  copySync(srcPath, dstPath);
}

function copySync(srcPath, dstPath) {
  if (checkSameSizeFiles(srcPath, dstPath)) {
    return;
  }

  fse.copySync(srcPath, dstPath);
}

TutorialImporter.prototype.syncTask = function*(taskPath, parent) {
  log.info("syncTask", taskPath);

  const contentPath = path.join(taskPath, 'task.md');
  const content = fs.readFileSync(contentPath, 'utf-8').trim();

  const taskPathName = path.basename(taskPath);

  const data = {
    content: content,
    parent:  parent._id
  };

  data.weight = parseInt(taskPathName);
  data.slug = taskPathName.slice(String(data.weight).length + 1);

  yield Task.destroy({slug: data.slug});

  const options = {
    staticHost:      config.server.staticHost,
    resourceWebRoot: Task.getResourceWebRootBySlug(data.slug),
    metadata:        {},
    trusted:         true
  };

  const parsed = new BodyParser(content, options).parseAndWrap();
  this.checkIfErrorsInParsed(parsed);
  data.title = this.extractHeader(parsed);

  data.importance = options.metadata.importance;

  const solutionPath = path.join(taskPath, 'solution.md');
  const solution = fs.readFileSync(solutionPath, 'utf-8').trim();
  data.solution = solution;

  log.debug("parsing solution");

  options.metadata = {};
  //console.log(util.inspect(options, {depth: 50}));
  const parsedSolution = new BodyParser(solution, options).parseAndWrap();

  this.checkIfErrorsInParsed(parsedSolution);

  const task = new Task(data);
  yield task.persist();

  const subPaths = fs.readdirSync(taskPath);

  for (var i = 0; i < subPaths.length; i++) {
    // names starting with _ don't sync
    if (subPaths[i] == 'task.md' || subPaths[i] == 'solution.md' || subPaths[i][0] == '_') continue;

    var subPath = path.join(taskPath, subPaths[i]);

    if (subPath.endsWith('.view')) {
      yield* this.syncView(subPath, task);
    } else {
      yield* this.syncResource(subPath, task.getResourceFsRoot());
    }
  }

  if (fs.existsSync(path.join(taskPath, '_js.view'))) {
    yield* this.syncTaskJs(path.join(taskPath, '_js.view'), task);
  }

  this.onchange(task.getUrl());

};

TutorialImporter.prototype.syncView = function*(dir, parent) {
  var pathName = path.basename(dir).replace('.view', '');

  if (pathName == '_js') {
    throw new Error("Must not syncView " + pathName);
  }

  var webPath = parent.getResourceWebRoot() + '/' + pathName;

  log.debug("syncView", webPath);
  var plunk = yield Plunk.findOne({webPath: webPath}).exec();

  if (plunk) {
    log.debug("Plunk from db", plunk);
  } else {
    plunk = new Plunk({
      webPath:     webPath,
      description: "Fork from http://javascript.ru"
    });
    log.debug("Created new plunk (db empty)", plunk);
  }

  var filesForPlunk = require('plunk').readFs(dir);
  log.debug("Files for plunk", filesForPlunk);

  if (!filesForPlunk) return; // had errors

  yield* plunk.mergeAndSyncRemote(filesForPlunk);

  log.debug("Plunk merged");

  var dst = path.join(parent.getResourceFsRoot(), pathName);

  fse.ensureDirSync(dst);
  fs.readdirSync(dir).forEach(function(dirFile) {
    log.debug("Copy %s to %s", dir, dst);
    copySync(path.join(dir, dirFile), path.join(dst, dirFile));
  });
};


TutorialImporter.prototype.syncTaskJs = function*(jsPath, task) {

  log.debug("syncTaskJs", jsPath);

  var sourceJs;

  try {
    sourceJs = fs.readFileSync(path.join(jsPath, 'source.js'), 'utf8');
  } catch (e) {
    sourceJs = "// ...ваш код...";
  }

  var testJs;
  try {
    testJs = fs.readFileSync(path.join(jsPath, 'test.js'), 'utf8');
  } catch (e) {
    testJs = "";
  }

  var solutionJs = fs.readFileSync(path.join(jsPath, 'solution.js'), 'utf8');

  // Source
  var webPath = task.getResourceWebRoot() + '/source';

  var source = makeSource(sourceJs, testJs);

  var sourcePlunk = yield Plunk.findOne({webPath: webPath}).exec();

  if (!sourcePlunk) {
    sourcePlunk = new Plunk({
      webPath:     webPath,
      description: "Fork from http://javascript.ru"
    });
  }

  var filesForPlunk = {
    'index.html': {
      content:  source,
      filename: 'index.html'
    },
    'test.js':    !testJs ? null : {
      content:  testJs.trim(),
      filename: 'test.js'
    }
  };

  log.debug("save plunk for ", webPath);
  yield* sourcePlunk.mergeAndSyncRemote(filesForPlunk);

  // Solution
  var webPath = task.getResourceWebRoot() + '/solution';

  var solution = makeSolution(solutionJs, testJs);

  var solutionPlunk = yield Plunk.findOne({webPath: webPath}).exec();

  if (!solutionPlunk) {
    solutionPlunk = new Plunk({
      webPath:     webPath,
      description: "Fork from http://javascript.ru"
    });
  }

  var filesForPlunk = {
    'index.html': {
      content:  solution,
      filename: 'index.html'
    },
    'test.js':    !testJs ? null : {
      content:  testJs.trim(),
      filename: 'test.js'
    }
  };

  log.debug("save plunk for ", webPath);
  yield* solutionPlunk.mergeAndSyncRemote(filesForPlunk);

};


function makeSource(sourceJs, testJs) {
  var source = "<!DOCTYPE HTML>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n";
  if (testJs) {
    source += "  <script src=\"http://js.cx/test/libs.js\"></script>\n";
    source += "  <script src=\"test.js\"></script>\n";
  }
  source += "</head>\n<body>\n\n  <script>\n\n";

  source += sourceJs.trim().replace(/^/gim, '    ');
  source += "\n\n  </script>\n";
  source += "\n</body>\n</html>";
  return source;
}


function makeSolution(solutionJs, testJs) {
  var solution = "<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n";
  if (testJs) {
    solution += "  <script src=\"http://js.cx/test/libs.js\"></script>\n";
    solution += "  <script src=\"test.js\"></script>\n";
  }
  solution += "</head>\n<body>\n\n  <script>\n\n";

  solution += solutionJs.trim().replace(/^/gim, '    ');

  solution += "\n\n  </script>\n";
  solution += "\n</body>\n</html>";

  return solution;
}


function checkSameSizeFiles(filePath1, filePath2) {
  if (!fs.existsSync(filePath2)) return false;

  const stat1 = fs.statSync(filePath1);
  if (!stat1.isFile()) {
    throw new Error("not a file: " + filePath1);
  }

  const stat2 = fs.statSync(filePath2);
  if (!stat2.isFile()) {
    throw new Error("not a file: " + filePath2);
  }

  return stat1.size == stat2.size;

}


module.exports = TutorialImporter;
