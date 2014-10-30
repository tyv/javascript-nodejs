var fs = require('fs');
var path = require('path');
var mime = require('mime');
var log = require('log')();

function* readPlunkContent(dir) {

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

  var plunk = {};
  var plunkFilePath = path.join(dir, '.plnkr');

  if (fs.existsSync(plunkFilePath)) {
    var existingPlunk = fs.readFileSync(plunkFilePath, 'utf-8');
    existingPlunk = JSON.parse(existingPlunk);

    // dir name change = new plunk
    var plunkDirName = path.basename(fs.realpathSync(dir));
    if (existingPlunk.name == plunkDirName) {
      plunk = existingPlunk;
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
    plunk: plunk,
    files: filesForPlunk
  };
}

module.exports = readPlunkContent;

/*
require('co')(readPlunkContent('/private/var/site/js-dev/tutorial/03-more/11-css-for-js/17-css-sprite/height48'))(function(err, res) {
  if (err) console.error(err.message, err.stack);
  else console.log(res);
});
*/