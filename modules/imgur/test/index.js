var imgur = require('..');
var fs = require('fs');
var path = require('path');

describe("imgur", function() {

  describe("transload", function() {

    var urlExample = 'http://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/LARGE_elevation.jpg/800px-LARGE_elevation.jpg';
    var url14MB = 'http://upload.wikimedia.org/wikipedia/commons/3/3d/LARGE_elevation.jpg';

    it("works for a normal url", function*() {
      var response = yield* imgur.transload(urlExample);
      response.should.be.string;
    });


    it("fails for too big picture", function*() {
      var hasError = false;
      try {
        yield* imgur.transload(url14MB);
      } catch (e) {
        hasError = true;
      }
      hasError.should.be.true;
    });


  });

  describe("uploadStream", function() {

    it("uploads a stream as image (gif)", function*() {

      var filePath = path.join(__dirname, 'ball.gif');
      var stream = fs.createReadStream(filePath);

      var response = yield* imgur.uploadStream(filePath, fs.statSync(filePath).size, stream);

      response.size.should.be.eql(fs.statSync(filePath).size);
      response.should.be.string;
    });

    it("uploads a stream as image (png)", function*() {

      var filePath = path.join(__dirname, 'test.png');
      var stream = fs.createReadStream(filePath);

      var response = yield* imgur.uploadStream(filePath,  fs.statSync(filePath).size, stream);

      response.size.should.be.eql(fs.statSync(filePath).size);
      response.should.be.string;
    });

  });


});