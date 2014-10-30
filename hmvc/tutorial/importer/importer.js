const co = require('co');
const util = require('util');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const config = require('config');
const mongoose = require('lib/mongoose');

require('lib/requireJade');

const Article = require('tutorial').Article;
const Reference = require('tutorial').Reference;
const Task = require('tutorial').Task;
const BodyParser = require('simpledownParser').BodyParser;
const TreeWalkerSync = require('simpledownParser').TreeWalkerSync;
const HeaderTag = require('simpledownParser').HeaderTag;
const gm = require('gm');
const log = require('log')();


// TODO: separate minification to another task
// TODO: use htmlhint/jslint for html/js examples

function Importer(options) {
  this.root = fs.realpathSync(options.root);
  this.onchange = options.onchange || function() {};
}

Importer.prototype.sync = function* (directory) {

  var dir = fs.realpathSync(directory);
  var type;
  while(true) {
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
  var parentSlug = path.basename(parentDir).slice(3);
  var parent = yield Article.findOne({slug: parentSlug}).exec();

  yield* this['sync' + type](dir, parent);

};

Importer.prototype.extractHeader = function(parsed) {
  log.debug("extracting header");

  const titleHeader = parsed.getChild(0);
  if (titleHeader.getType() != 'HeaderTag') {
    throw new Error("must start with a #Header");
  }

  return titleHeader.text; // no more ugly code in headers
};


// todo with incremental import: move to separate task?
Importer.prototype.checkIfErrorsInParsed = function(parsed) {
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


Importer.prototype.destroyAll = function* () {
  yield Article.destroy({});
  yield Task.destroy({});
  yield Reference.destroy({});
};

Importer.prototype.syncFolder = function*(sourceFolderPath, parent) {
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
  data.slug = folderFileName.slice(3);

  yield Article.destroyTree({slug: data.slug});

  var options = {
    staticHost:      config.staticHost,
    resourceWebRoot: Article.getResourceWebRootBySlug(data.slug),
    metadata:        {},
    trusted:         true
  };

  const parsed = new BodyParser(content, options).parseAndWrap();

  this.checkIfErrorsInParsed(parsed);
  data.title = this.extractHeader(parsed);

  const folder = new Article(data);
  yield folder.persist();
  this.onchange(folder.getUrl());

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

};

Importer.prototype.syncArticle = function* (articlePath, parent) {
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
  data.slug = articlePathName.slice(3);

  yield Article.destroyTree({slug: data.slug});

  const options = {
    staticHost:      config.staticHost,
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
  this.onchange(article.getUrl());

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
      yield this.syncTask(subPath, article);
    } else {
      // resources
      yield this.syncResource(subPath, article.getResourceFsRoot());
    }
  }


};

Importer.prototype.syncResource = function*(sourcePath, destDir) {
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

  var isRetina = /@2x\.[^.]+$/.test(srcPath);

  if (isRetina) {
    var normalResolutionFilename = filename.replace(/@2x(?=\.[^.]+$)/, '');
    var normalResolutionPath = path.join(dstDir, normalResolutionFilename);

    yield function(callback) {
      gm(srcPath).resize("50%").write(normalResolutionPath, callback);
    };
  }

}

function copySync(srcPath, dstPath) {
  if (checkSameSizeFiles(srcPath, dstPath)) {
    return;
  }

  fse.copySync(srcPath, dstPath);
}

Importer.prototype.syncTask = function*(taskPath, parent) {
  log.info("syncTask", taskPath);

  const contentPath = path.join(taskPath, 'task.md');
  const content = fs.readFileSync(contentPath, 'utf-8').trim();

  const taskPathName = path.basename(taskPath);

  const data = {
    content: content,
    parent:  parent._id
  };

  data.weight = parseInt(taskPathName);
  data.slug = taskPathName.slice(3);

  yield Task.destroy({slug: data.slug});

  const options = {
    staticHost:      config.staticHost,
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
  console.log(util.inspect(options, {depth: 50}));
  const parsedSolution = new BodyParser(solution, options).parseAndWrap();

  this.checkIfErrorsInParsed(parsedSolution);

  const task = new Task(data);
  yield task.persist();
  this.onchange(task.getUrl());

  const subPaths = fs.readdirSync(taskPath);

  for (var i = 0; i < subPaths.length; i++) {
    if (subPaths[i] == 'task.md' || subPaths[i] == 'solution.md') continue;

    var subPath = path.join(taskPath, subPaths[i]);
    yield* this.syncResource(subPath, task.getResourceFsRoot());
  }

};


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


module.exports = Importer;
