var fs = require('fs');
var path = require('path');

var uploadStream = require('../lib/uploadStream');

describe("imgur", function() {

  describe("uploadStream", function() {

    it("uploads a stream as image (gif)", function*() {

      var filePath = path.join(__dirname, 'ball.gif');
      var stream = fs.createReadStream(filePath);

      var response = yield* uploadStream(filePath, fs.statSync(filePath).size, stream);

      response.size.should.be.eql(fs.statSync(filePath).size);
      response.should.be.string;
    });

    it("uploads a stream as image (png)", function*() {

      var filePath = path.join(__dirname, 'test.png');
      var stream = fs.createReadStream(filePath);

      var response = yield* uploadStream(filePath,  fs.statSync(filePath).size, stream);

      response.size.should.be.eql(fs.statSync(filePath).size);
      response.should.be.string;
    });

  });


});
