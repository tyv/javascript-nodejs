var path = require('path');
var fs = require('mz/fs');
var config = require('config');

exports.get = function*() {

  var playId = this.params.playId;

  if (playId) {
    playId = playId.replace(/\W/g, ''); // must be alphpanumeric

    var playPath = playId.slice(0,2).toLowerCase() + '/' + playId.slice(2,4).toLowerCase() + '/' + playId + '.zip';

    //console.log(playPath);

    var exists = yield fs.exists(path.join(config.projectRoot, 'play', playPath));
    if (!exists) {
      this.throw(404);
    }

    this.locals.play = {
      url:   `/play/${playPath}`,
      title: `${playId}.zip`
    };

    this.body = this.render('play');
  } else {
    this.body = this.render('index');
  }

};
