const app = require('app');
const supertest = require('supertest');
const should = require('should');

describe("HttpPostParser", function() {

  before(function* () {

    // if app.isListening, then we can't add our middleware
    should.not.exist(app.isListening);

    app.use(function*(next) {
      if ('/test/http-post-parser' != this.path) return yield next;
      this.body = this.req.body;
    });

    yield app.run();

  });

  it("parses body", function(done) {

    var message = { name: 'Manny', species: 'cat' };
    supertest(app)
      .post('/test/http-post-parser')
      .send(message)
      .end(function(error, res) {
        res.body.should.be.eql(message);
        done(error);
      });

  });

  it("dies when the file is too big", function(done) {

    // fixme: superagent console.warns: double callback!
    // seems like a bug in superagent: https://github.com/visionmedia/superagent/issues/351
    supertest(app)
      .post('/test/http-post-parser')
      .send({big: new Array(1e7).join(' ')})
      .expect(413, done);

  });

});
