/* globals describe, it, before */

const db = require('lib/dataUtil');
const mongoose = require('mongoose');
const path = require('path');
const request = require('supertest');
const fixtures = require(path.join(__dirname, '../fixtures/db'));
const app = require('app');
const assert = require('better-assert');

describe('Authorization', function() {

  var server;
  before(function*() {

    yield* db.loadModels(fixtures, {reset: true});

    // APP.LISTEN() USES A RANDOM PORT,
    // which superagent gets as server.address().port
    server = app.listen();
  });

  after(function() {
    server.close();
  });

  describe('login', function() {

    it('should require verified email', function(done) {
      request(server)
        .post('/auth/login/local')
        .send({
          email:    fixtures.User[2].email,
          password: fixtures.User[2].password
        })
        .expect(401, done);
    });
  });

  describe('login flow', function() {
    var agent;

    before(function() {
      agent = request.agent(server);
    });

    it('should log in when email is verified', function(done) {
      agent
        .post('/auth/login/local')
        .send({
          email:    fixtures.User[0].email,
          password: fixtures.User[0].password
        })
        .expect(200, done);
    });

    it('should log out', function(done) {
      agent
        .post('/auth/logout')
        .send()
        .expect(302, done);
    });

    it('should return error when repeat logout (the session is incorrect)', function(done) {
      agent
        .post('/auth/logout')
        .send()
        .expect(401, done)
    });
  });

  describe("register", function() {
    var agent;

    before(function() {
      agent = request.agent(server);
    });

    var userData = {
      email:       Math.random() + "@gmail.com",
      displayName: "Random guy",
      password:    "somepass"
    };

    it('should create a new user', function(done) {
      agent
        .post('/auth/register')
        .send(userData)
        .expect(201, done);
    });

    it('should not be logged in', function(done) {
      agent
        .post('/auth/logout')
        .send('')
        .expect(401, done);
    });
    /*

     .end(function(err, res) {
     res.body.email.should.be.eql(userData.email);
     res.body.displayName.should.be.eql(userData.displayName);
     done(err);
     });
     it('should be log in the new user', function(done) {
     request(server)
     .post('/auth/login/local')
     .send({email: userData.email, password: userData.password})
     .expect(200, done);
     });
     */

    it('should fail to create a new user with same email', function(done) {
      request(server)
        .post('/auth/register')
        .send(userData)
        .set('Accept', 'application/json')
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.errors.email.should.exist;
          done();
        });
    });

  });

});
