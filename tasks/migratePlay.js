var fs = require('fs');
var co = require('co');
var path = require('path');
var gutil = require('gulp-util');
var dataUtil = require('lib/dataUtil');
var mongoose = require('lib/mongoose');
var projectRoot = require('config').projectRoot;
var mysql = require('mysql');
var zip = require('node-zip');


module.exports = function() {
  return function() {

    return co(function*() {

      var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'js'
      });

      connection.connect();

      var plays = yield function(callback) {
        connection.query('SELECT * FROM play_save where name="demo"', function(err, rows, fields) {
          callback(err, rows);
        });
      };

      plays = plays.map(function(play) {
        return {
          id: play.id,
          name: play.name,
          url: 'http://learn.javascript.ru/play/' + play.name,
          content: JSON.parse(play.content)
        };
      });

      for (var i = 0; i < plays.length; i++) {
        var play = plays[i];
        yield* exportPlay(connection, play);
      }
      console.log(plays[0].content);

      connection.end();

    });

  };
};


function* exportPlay(db, play) {


  var resources = yield function(callback) {
    db.query(`
      SELECT play_id,resource_id,name,fs_name,created
      FROM play_save_resources psr, play_resources pr
      WHERE psr.resource_id=pr.id AND play_id=?
      ORDER BY created desc`, [play.id], function(err, rows, fields) {
      callback(err, rows);
    });
  };


  play.content.files = resources;

  var archive = new zip();

  for (var i = 0; i < play.content.tabs.length; i++) {
    var tab = play.content.tabs[i];
    archive.file(tab.name, tab.content);
  }

  for (var i = 0; i < play.content.files.length; i++) {
    var file = play.content.files[i];
    archive.file(file.name, fs.readFileSync('/var/site/js/www/files/play/' + file.fs_name));
  }

  return archive.generate({base64:false,compression:'DEFLATE'});


}