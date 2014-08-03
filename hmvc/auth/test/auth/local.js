/* globals describe, it, before */

const db = require('lib/dataUtil');
const mongoose = require('mongoose');
const path = require('path');
const request = require('supertest');
const fixtures = require(path.join(__dirname, './fixtures/db'));
const app = require('app');
const assert = require('better-assert');

describe('Authorization', function() {

  var agent, server;
  before(function * () {
    yield db.loadDb(path.join(__dirname, './fixtures/db'));

    // app.listen() uses a random port,
    // which superagent gets as server.address().port
    // so that every run will get it's own port
    server = app.listen();
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

  describe("register", function() {

    var userData = {email: "angelina@gmail.com", displayName: "Angelina Jolie", password: "angelina" };
    it('should create a new user', function(done) {
      agent
        .post('/auth/register')
        .send(userData)
        .expect(201, done);
    });

    it('should be logged in', function(done) {
      agent
        .get('/auth/user')
        .expect(200)
        .end(function(err, res) {
          res.body.email.should.be.eql(userData.email);
          res.body.displayName.should.be.eql(userData.displayName);
          done(err);
        });
    });
    /*
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
        .expect(409, done);
    });

  });
});
