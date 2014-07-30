/* globals describe, it, before */

const db = require('lib/dataUtil');
const mongoose = require('mongoose');
const path = require('path');
const request = require('supertest');
const fixtures = require(path.join(__dirname, './fixtures/db'));
const app = require('app');
const assert = require('better-assert');

describe('Authorization', function() {

  var agent;
  before(function * () {
    yield db.loadDb(path.join(__dirname, './fixtures/db'));

    // app.listen() uses a random port,
    // which superagent gets as server.address().port
    // so that every run will get it's own port
    var server = app.listen();
    agent = request.agent(server);

  });

  describe('login', function() {

    it('should log me in', function(done) {
      agent
        .post('/auth/login/local')
        .send({
          email:    fixtures.User[0].email,
          password: fixtures.User[0].password
        })
        .expect(200, done);
    });

    it('should return current user info', function(done) {
      agent
        .get('/auth/user')
        .expect(200)
        .end(function(err, res) {
          res.body.email.should.be.eql(fixtures.User[0].email);
          done(err);
        });
    });

  });

  describe('logout', function() {
    it('should log me out', function(done) {
      agent
        .post('/auth/logout')
        .send('')
        .expect(302, done);
    });

    it('should return error because session is incorrect', function(done) {
      agent
        .get('/auth/user')
        .expect(403, done);
    });
  });
});
