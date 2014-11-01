var fs = require('fs');
var path = require('path');
var mime = require('mime');
var log = require('log')();

function* readFs(dir) {

  var files = fs.readdirSync(dir);

  var errors = [];
  files = files.filter(function(file) {
    if (file[0] == ".") return false;

    var filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      errors.push("Directory not allowed: " + file);
      return false;
    }

    var type = mime.lookup(file).split('/');
    if (type[0] != 'text' && type[1] != 'json' && type[1] != 'javascript') {
      errors.push("Bad file extension: " + file);
    }

    return true;
  });

  var meta = {};
  var plunkFilePath = path.join(dir, '.plnkr');

  if (fs.existsSync(plunkFilePath)) {
    var existingPlunk = fs.readFileSync(plunkFilePath, 'utf-8');
    existingPlunk = JSON.parse(existingPlunk);

    // dir name change (2 levels up) = new plunk
    var plunkDirName = fs.realpathSync(dir);
    plunkDirName = path.basename(path.dirname(plunkDirName)) + path.sep + path.basename(plunkDirName);

    if (existingPlunk.name == plunkDirName) {
      meta = existingPlunk;
    }
  }


  if (errors.length) {
    log.error(errors);
    return false;
  }

  var filesForPlunk = {};
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    filesForPlunk[file] = {
      filename: file,
      content: fs.readFileSync(path.join(dir, file), 'utf-8')
    };
  }

  return {
    meta: meta,
    files: filesForPlunk
  };
}

module.exports = readFs;

/*
require('co')(readPlunkContent('/private/var/site/js-dev/tutorial/03-more/11-css-for-js/17-css-sprite/height48'))(function(err, res) {
  if (err) console.error(err.message, err.stack);
  else console.log(res);
});
*/