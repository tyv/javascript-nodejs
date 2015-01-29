var chokidar = require('chokidar');
var fs = require('fs');
var path = require('path');
var co = require('co');

function onModify(file) {
  if (~filePath.indexOf('___jb_')) return; // ignore JetBrains Webstorm tmp files

  // rerun tasks only in the case of these events
  // WE DO NOT KNOW FOR SURE WHAT HAS HAPPENED WITH THE FILE
  // not sure what actually happened, because fsevents adds all flags to the event
  // e.g if I create -> remove -> create the same file,
  // fsevents will finally contain both ItemCreated and ItemRemoved flags
  if (!( flags & FsEventsFlags.ItemCreated ||
    flags & FsEventsFlags.ItemRemoved ||
    flags & FsEventsFlags.ItemRenamed ||
    flags & FsEventsFlags.ItemModified
    )) {

    return;
  }

  //console.log(filePath, getFlagNames(flags));

  this.callback(filePath, flags, id);
}

module.exports = function(root, callback) {

  var watcher = chokidar.watch(root, {ignoreInitial: true});

  watcher.callback = callback;

  watcher.on('add', onModify);
  watcher.on('change', onModify);
  watcher.on('unlink', onModify);
  watcher.on('unlinkDir', onModify);
  watcher.on('addDir', onModify);

};

module.exports.FsEventsFlags = FsEventsFlags;
module.exports.getFlagNames = getFlagNames;
