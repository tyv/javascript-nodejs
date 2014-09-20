/**
 * Autorun tasks *sequentially* on watch events
 */

var gulp = require('gulp');
var minimatch = require("minimatch");
var fsevents = require('fsevents');
var fs = require('fs');
var runSequence = require('run-sequence');

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

var taskQueue = [];
var taskRunning = '';

function log() {
  return;

  var args = [].slice.call(arguments);
  args.unshift(Date.now() % 1e6);

  console.log.apply(console, args);
}

function pushTaskQueue(task) {
  if (~taskQueue.indexOf(task)) {
    log("queue: already exists", task);
    return;
  }
  /* (maybe the task should be moved into the end of the queue? couldn't find any practical difference)
   if (~taskQueue.indexOf(task)) {
   log("queue: already exists, removing", task);
   taskQueue.splice(taskQueue.indexOf(task), 1);
   }
   */
  taskQueue.push(task);
  log("push", taskQueue);

  if (!taskRunning) {
    runNext();
  }
}

function runNext() {
  if (!taskQueue.length) return;

  taskRunning = taskQueue.shift();
  log("runNext start", taskRunning, "queue", taskQueue);

  runSequence(taskRunning, function(err) {
    log("runNext finish", taskRunning);
    taskRunning = '';
    runNext();
  });
}

function getFlagNames(flags) {

  var matchingFlags = [];
  for (var flag in FsEventsFlags) {
    if (FsEventsFlags[flag] & flags) matchingFlags.push(flag);
  }

  return matchingFlags;
}


function onFsEvents(filePath, flags, id) {
  if (~filePath.indexOf('___jb_')) return; // ignore JetBrains Webstorm tmp files

  var relFilePath = filePath.slice(this.root.length + 1);

  log(relFilePath, getFlagNames(flags));

  // rerun tasks only in the case of these events
  // WE DO NOT KNOW FOR SURE WHAT HAS HAPPENED WITH THE FILE
  // not sure what actually happened, because fsevents adds all flags to the event
  // e.g if I create -> remove -> create the same file,
  // fsevents will finally contain both ItemCreated and ItemRemoved flags
  if (!( flags & FsEventsFlags.ItemCreated ||
    flags & FsEventsFlags.ItemRemoved ||
    flags & FsEventsFlags.ItemRenamed ||
    flags & FsEventsFlags.ItemModified
    )) return;

  // FS EVENTS COME AFTER LATENCY, fsevents/src/thread.cc:
  // FSEventStreamCreate(NULL, &HandleStreamEvents, &context, fse->paths, kFSEventStreamEventIdSinceNow, (CFAbsoluteTime) 0.1, kFSEventStreamCreateFlagNone | kFSEventStreamCreateFlagWatchRoot | kFSEventStreamCreateFlagFileEvents | kFSEventStreamCreateFlagUseCFTypes);
  // (the DEFAULT LATENCY IS 0.1)
  // so it may be worthwhile to wait 0.1 after the task, to make sure everything's finished

  function watch(mapping, task) {
    // mapping.watch mapping.ignore mapping.task
    var patternsWatch = Array.isArray(mapping.watch) ? mapping.watch : [mapping.watch];
    var patternsIgnore = !mapping.ignore ? [] :
      Array.isArray(mapping.ignore) ? mapping.ignore : [mapping.ignore];

    // matches any watch => found=true
    var found = false, i, pattern;
    for (i = 0; i < patternsWatch.length; i++) {
      pattern = patternsWatch[i];
      if (minimatch(relFilePath, pattern)) {
        found = true;
        break;
      }
    }

    if (!found) return;

    // matches any ignore => found=false
    for (i = 0; i < patternsIgnore.length; i++) {
      pattern = patternsIgnore[i];

      if (minimatch(relFilePath, pattern)) {
        found = false;
        break;
      }
    }

    if (!found) return;

    pushTaskQueue(mapping.task);
  }

  this.taskMapping.forEach(watch);
}

// options.root - where to start watching
// options.taskMapping - regexp -> task mappings
module.exports = function(options) {

  return function(callback) {
    var watcher = fsevents(options.root);

    watcher.root = options.root;
    watcher.taskMapping = options.taskMapping;

    watcher.on('fsevent', onFsEvents);

    watcher.start();
  };

};
