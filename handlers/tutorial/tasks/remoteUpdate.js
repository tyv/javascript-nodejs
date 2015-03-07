/**
 * Copy local collections to remove mongo without drop
 * (drop breaks elastic)
 */

var co = require('co');
var fs = require('fs');
var path = require('path');
var log = require('log')();
var del = require('del');
var gutil = require('gulp-util');
var execSync = require('child_process').execSync;

module.exports = function(options) {

  return function() {

    var args = require('yargs')
      .usage("Path to host is required.")
      .demand(['host'])
      .argv;

    var collections = ['tasks', 'plunks', 'articles', 'references'];

    var host = args.host;
    return co(function* () {

      del.sync('dump');
      collections.forEach(function(coll) {
        exec('mongodump -d js -c ' + coll);
      });
      exec('mv dump/js dump/js_sync');
      exec('ssh ' + args.host + ' "rm -rf dump"');

      // copy/overwrite collections from js_sync to js and then remove non-existing ids
      fs.writeFileSync("/tmp/cmd.js", collections.map(function(coll) {
        // copyTo does not work
        // also see https://jira.mongodb.org/browse/SERVER-732
        var cmd = "db.getSiblingDB('js_sync').C.find().forEach(function(d) { db.C.insert(d) }) \n\
          vals = db.getSiblingDB('js_sync').C.find({}, {id:1}).map(function(a){return a._id;}); \n\
          db.C.remove({_id: {$nin: vals}});".replace(/C/g, coll);

        return cmd;

      }).concat('db.cacheentries.remove({});').join("\n\n"));

      exec('scp -r -C dump ' + host + ':');
      exec('ssh ' + host + ' "mongorestore --drop"');

      exec('scp /tmp/cmd.js ' + host + ':/tmp/');
      exec('ssh ' + host + ' "mongo js /tmp/cmd.js"');

      exec('rsync -rlDv /js/javascript-nodejs/public/ ' + host + ':/js/javascript-nodejs/current/public/');
    });
  };
};

function exec(cmd) {
  gutil.log(cmd);
  execSync(cmd, {stdio: 'inherit'});
}

/*
 #!/bin/bash


 rm -rf dump &&
 mongodump -d js -c tasks &&
 mongodump -d js -c plunks &&
 mongodump -d js -c articles &&
 mongodump -d js -c references &&
 ssh nightly 'rm -rf dump' &&
 scp -r -C dump nightly: &&
 ssh nightly 'mongorestore --drop ' &&
 rsync -rlDv /js/javascript-nodejs/public/ nightly:/js/javascript-nodejs/current/public/ &&
 ssh nightly 'cd /js/javascript-nodejs/current/scripts/elastic; bash db' &&
 echo "Tutorial updated"


 db.getSiblingDB('js_sync').articles.copyTo(db.articles)
 vals = db.getSiblingDB('js_sync').articles.find({}, {id:1}).map(function(a){return a._id;})
 db.articles.remove({_id: {$nin: vals}})
*/