var fs = require('fs');
var path = require('path');

var transload = require('../lib/transload');

describe("imgur", function() {

  describe("transload", function() {

    var urlExample = 'http://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/LARGE_elevation.jpg/800px-LARGE_elevation.jpg';
    var url14MB = 'http://upload.wikimedia.org/wikipedia/commons/3/3d/LARGE_elevation.jpg';

    it("works for a normal url", function*() {
      var response = yield* transload(urlExample);
      response.imgurId.should.be.string;
    });


    it("fails for too big picture", function*() {
      var hasError = false;
      try {
        yield* transload(url14MB);
      } catch (e) {
        hasError = true;
      }
      hasError.should.be.true;
    });


  });


});
