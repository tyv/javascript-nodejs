const co = require('co');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const log = require('lib/log')(module);
const mongoose = require('lib/mongoose');
const Article = mongoose.models.Article;
const Task = mongoose.models.Task;
const articlePathHelper = require('lib/pathHelper').articlePathHelper;
const taskPathHelper = require('lib/pathHelper').taskPathHelper;
const BodyParser = require('javascript-parser').BodyParser;
const HtmlTransformer = require('javascript-parser').HtmlTransformer;
const HeaderTag = require('javascript-parser').HeaderTag;
const Imagemin = require('imagemin');
const pngcrush = require('imagemin-pngcrush');
const gm = require('gm');
const svgo = require('imagemin-svgo');

/**
 *
 * @param options
 *  options.minify  => true to enable minification
 *  options.root => the root to import from
 * @returns {Function}
 */
module.exports = function(options) {
  const root = options.root;

  return function(callback) {

    co(function *() {

      yield Article.destroy({});
      yield Task.destroy({});

      fse.removeSync(articlePathHelper.resourceRoot);
      fse.removeSync(taskPathHelper.resourceRoot);

      fs.mkdirSync(articlePathHelper.resourceRoot);
      fs.mkdirSync(taskPathHelper.resourceRoot);


      const subPaths = fs.readdirSync(root);

      for (var i = 0; i < subPaths.length; i++) {
        var subPath = path.join(root, subPaths[i]);
        if (fs.existsSync(path.join(subPath, 'index.md'))) {
          yield importFolder(subPath, null);
        }
      }

      mongoose.disconnect();

    })(callback);
  };

  function stripTags(str) {
    return str.replace(/<\/?[a-z].*?>/gim, '');
  }

  function htmlTransform(roots, options) {
    return new HtmlTransformer(roots, options).toHtml();
  }

  function* importFolder(sourceFolderPath, parent) {
    log.info("importFolder", sourceFolderPath);

    const contentPath = path.join(sourceFolderPath, 'index.md');
    const content = fs.readFileSync(contentPath, 'utf-8');

    const folderFileName = path.basename(sourceFolderPath);

    const data = {
      content: content
    };

    if (parent) {
      data.parent = parent._id;
    }

    data.weight = parseInt(folderFileName);
    data.slug = folderFileName.slice(3);

    const options = {
      resourceFsRoot:  sourceFolderPath,
      resourceWebRoot: articlePathHelper.getResourceWebRootBySlug(data.slug),
      metadata:        {},
      trusted:         true
    };

    const parsed = yield new BodyParser(content, options).parse();

    const titleHeader = parsed[0];
    if (parsed[0].getType() != 'HeaderTag') {
      throw new Error(contentPath + ": must start with a #Header");
    }

    data.title = stripTags(htmlTransform(titleHeader, options));


    const folder = new Article(data);
    yield folder.persist();

    const subPaths = fs.readdirSync(sourceFolderPath);

    for (var i = 0; i < subPaths.length; i++) {
      if (subPaths[i] == 'index.md') continue;

      var subPath = path.join(sourceFolderPath, subPaths[i]);

      if (fs.existsSync(path.join(subPath, 'index.md'))) {
        yield importFolder(subPath, folder);
      } else if (fs.existsSync(path.join(subPath, 'article.md'))) {
        yield importArticle(subPath, folder);
      } else {
        yield importResource(subPath, articlePathHelper.getResourcePath(folder));
      }
    }

  }

  function* importArticle(articlePath, parent) {
    log.info("importArticle", articlePath);

    const contentPath = path.join(articlePath, 'article.md');
    const content = fs.readFileSync(contentPath, 'utf-8');

    const articlePathName = path.basename(articlePath);

    const data = {
      content: content
    };

    if (parent) {
      data.parent = parent._id;
    }

    data.weight = parseInt(articlePathName);
    data.slug = articlePathName.slice(3);

    const options = {
      resourceFsRoot:  articlePath,
      resourceWebRoot: articlePathHelper.getResourceWebRootBySlug(data.slug),
      metadata:        {},
      trusted:         true
    };

    const parsed = yield new BodyParser(content, options).parse();

    const titleHeader = parsed[0];
    if (parsed[0].getType() != 'HeaderTag') {
      throw new Error(contentPath + ": must start with a #Header");
    }

    data.title = stripTags(htmlTransform(titleHeader, options));

    const article = new Article(data);
    yield article.persist();

    const subPaths = fs.readdirSync(articlePath);

    for (var i = 0; i < subPaths.length; i++) {
      if (subPaths[i] == 'article.md') continue;

      var subPath = path.join(articlePath, subPaths[i]);
      if (fs.existsSync(path.join(subPath, 'task.md'))) {
        yield importTask(subPath, article);
      } else {
        // resources
        yield importResource(subPath, articlePathHelper.getResourcePath(article));
      }
    }


  }

  function* importResource(sourcePath, destDir) {
    fse.ensureDirSync(destDir);

    log.info("importResource", sourcePath, destDir);

    const stat = fs.statSync(sourcePath);
    const ext = getFileExt(sourcePath);
    const destPath = path.join(destDir, path.basename(sourcePath));

    if (stat.isFile()) {
      if (ext == 'png' || ext == 'jpg' || ext == 'gif' || ext == 'svg') {
        yield importImage(sourcePath, destDir);
        return;
      }
      fse.copySync(sourcePath, destPath);
    } else if (stat.isDirectory()) {
      fs.mkdirSync(destPath);
      const subPathNames = fs.readdirSync(sourcePath);
      for (var i = 0; i < subPathNames.length; i++) {
        var subPath = path.join(sourcePath, subPathNames[i]);
        yield importResource(subPath, destPath);
      }

    } else {
      throw new Error("Unsupported file type at " + sourcePath);
    }

  }

  function getFileExt(filePath) {
    var ext = filePath.match(/\.([^.]+)$/);
    return ext && ext[1];
  }

  function* importImage(srcPath, dstDir) {
    log.info("importImage", srcPath, "to", dstDir);
    const filename = path.basename(srcPath);
    const dstPath = path.join(dstDir, filename);

    fse.copySync(srcPath, dstPath);
    yield minifyImage(dstPath);


    var isRetina = /@2x\.[^.]+$/.test(srcPath);


    if (isRetina) {
      var normalResolutionFilename = filename.replace(/@2x(?=\.[^.]+$)/, '');
      var normalResolutionPath = path.join(dstDir, normalResolutionFilename);
      yield function(callback) {
        gm(srcPath).resize("50%").write(normalResolutionPath, callback);
      };
      yield minifyImage(normalResolutionPath);
    }

  }

  function* minifyImage(imagePath) {
    if (!options.minify) return;
    log.info("minifyImage", imagePath);

    var plugin;
    switch (getFileExt(imagePath)) {
    case 'jpg':
      plugin = Imagemin.jpegtran({ progressive: true });
      break;
    case 'gif':
      plugin = Imagemin.gifsicle({ interlaced: true });
      break;
    case 'png':
      plugin = pngcrush({ reduce: true });
      break;
    case 'svg':
      plugin = svgo({});
      break;
    }

    var imagemin = new Imagemin()
      .src(imagePath)
      .dest(imagePath)
      .use(plugin);

    yield function(callback) {
      imagemin.optimize(callback);
    };

  }

  function* importTask(taskPath, parent) {
    log.info("importTask", taskPath);

    const contentPath = path.join(taskPath, 'task.md');
    const content = fs.readFileSync(contentPath, 'utf-8');

    const taskPathName = path.basename(taskPath);

    const data = {
      content: content,
      parent:  parent._id,
      slug:    taskPathName
    };

    const options = {
      resourceFsRoot:  taskPath,
      resourceWebRoot: taskPathHelper.getResourceWebRootBySlug(data.slug),
      metadata:        {},
      trusted:         true
    };

    const parsed = yield new BodyParser(content, options).parse();

    const titleHeader = parsed[0];
    if (parsed[0].getType() != 'HeaderTag') {
      throw new Error(contentPath + ": must start with a #Header");
    }

    data.title = stripTags(htmlTransform(titleHeader, options));

    data.importance = options.metadata.importance;

    const solutionPath = path.join(taskPath, 'solution.md');
    const solution = fs.readFileSync(solutionPath, 'utf-8');
    data.solution = solution;

    const task = new Task(data);
    yield task.persist();

    const subPaths = fs.readdirSync(taskPath);

    for (var i = 0; i < subPaths.length; i++) {
      if (subPaths[i] == 'task.md' || subPaths[i] == 'solution.md') continue;

      var subPath = path.join(taskPath, subPaths[i]);
      yield importResource(subPath, taskPathHelper.getResourcePath(task));
    }

  }

};