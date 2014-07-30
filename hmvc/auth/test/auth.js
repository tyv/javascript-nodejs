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
        .expect(200)
        .end(function(err, res) {
//          console.log(res.headers);
          // sessionId = res.headers['set-cookie'][0];
          done(err);
        });
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

  0 && describe('logout', function() {
    it('should log me out', function(done) {
      request(app)
        .get('/api/logout')
        .set('Cookie', sessionId)
        .expect(200)
        .end(function(err, res) {
          done(err);
        });
    });
    it('should return error because session is incorrected', function(done) {
      request(app)
        .get('/api/auth/user')
        .set('Cookie', sessionId)
        .expect(401)
        .end(function(err, res) {
          done(err);
        });
    });
  });
});
