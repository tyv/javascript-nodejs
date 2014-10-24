var fsevents = require('fsevents');
var fs = require('fs');
var path = require('path');
var co = require('co');

var FsEventsFlags = {
  None:              0x00000000,
  MustScanSubDirs:   0x00000001,
  UserDropped:       0x00000002,
  KernelDropped:     0x00000004,
  EventIdsWrapper:   0x00000008,
  HistoryDone:       0x00000010,
  RootChanged:       0x00000020,
  Mount:             0x00000040,
  Unmount:           0x00000080,
  ItemCreated:       0x00000100,
  ItemRemoved:       0x00000200,
  ItemInodeMetaMod:  0x00000400,
  ItemRenamed:       0x00000800,
  ItemModified:      0x00001000,
  ItemFinderInfoMod: 0x00002000,
  ItemChangeOwner:   0x00004000,
  ItemXattrMod:      0x00008000,
  ItemIsFile:        0x00010000,
  ItemIsDir:         0x00020000,
  ItemIsSymlink:     0x00040000
};

function getFlagNames(flags) {

  var matchingFlags = [];
  for (var flag in FsEventsFlags) {
    if (FsEventsFlags[flag] & flags) matchingFlags.push(flag);
  }

  return matchingFlags;
}

function onFsEvents(filePath, flags, id) {
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

  console.log(filePath, getFlagNames(flags));

  this.callback(filePath, flags, id);
}

module.exports = function(root, callback) {

  var watcher = fsevents(root);

  watcher.callback = callback;
  watcher.on('fsevent', onFsEvents);

  watcher.start();

};

module.exports.FsEventsFlags = FsEventsFlags;
module.exports.getFlagNames = getFlagNames;
