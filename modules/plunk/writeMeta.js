var fs = require('fs');
var path = require('path');

/**
 * Write information about plunk into .plunk file.
 *
 * At this time I write only name and id, NOT list of files,
 * because plunk may be updated online, independantly.
 */
function writeMeta(dir, id) {
  fs.writeFileSync(path.join(dir, ".plnkr"), JSON.stringify({
    name: path.basename(path.dirname(fs.realpathSync(dir))) + path.sep + path.basename(fs.realpathSync(dir)),
    id: id
  }));

}

module.exports = writeMeta;