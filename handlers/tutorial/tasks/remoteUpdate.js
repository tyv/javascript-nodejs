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
var config = require('config');

var ecosystem = require(path.join(config.projectRoot, 'ecosystem.json'));

module.exports = function(options) {

  return function() {

    var args = require('yargs')
      .usage("Path to host is required.")
      .demand(['host'])
      .argv;

    var collections = ['tasks', 'plunks', 'articles', 'references'];

    var host = args.host;
    return co(function* () {

      exec('rsync -rlDv /js/javascript-nodejs/public/ --exclude js --exclude css ' + host + ':/js/javascript-nodejs/current/public/');

      del.sync('dump');
      collections.forEach(function(coll) {
        exec('mongodump -d js -c ' + coll);
      });
      exec('mv dump/js dump/js_sync');

      exec('ssh ' + args.host + ' "rm -rf dump"');
      exec('scp -r -C dump ' + host + ':');

      exec('ssh ' + host + ' "mongorestore --drop"');

      var file = fs.openSync("/tmp/cmd.js", "w");

      fs.writeSync(file, 'mongo js --eval "db.articles.find().length()";\n');

      // copy/overwrite collections from js_sync to js and then remove non-existing ids
      fs.writeSync(file, collections.map(function(coll) {
        // copyTo does not work
        // also see https://jira.mongodb.org/browse/SERVER-732
        var cmd = "db.getSiblingDB('js_sync').C.find().forEach(function(d) { db.C.insert(d) }); \n\
          vals = db.getSiblingDB('js_sync').C.find({}, {id:1}).map(function(a){return a._id;}); \n\
          db.C.remove({_id: {$nin: vals}});".replace(/C/g, coll);

        return cmd;

      }).join("\n\n"));


      fs.writeSync(file, 'mongo js --eval "db.articles.find().length()";\n');

      fs.closeSync(file);

      exec('scp /tmp/cmd.js ' + host + ':/tmp/');

      // most reliable way to execute
      // mongo js /tmp/cmd.js didn't work stable for some reason (?)
      exec('ssh ' + host + ' "mongo js --eval \\"load(\'/tmp/cmd.js\')\\""');

      /* jshint -W106 */
      var env = ecosystem.apps[0].env_production;

      exec('ssh ' + host + ' "cd /js/javascript-nodejs/current && SITE_HOST=' + env.SITE_HOST+ ' STATIC_HOST=' + env.STATIC_HOST + ' gulp tutorial:cache:regenerate && gulp cache:clean"');
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