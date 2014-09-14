/* globals describe, it, before */

const db = require('lib/dataUtil');
const mongoose = require('mongoose');
const path = require('path');
const request = require('supertest');
const fixtures = require(path.join(__dirname, '../fixtures/db'));
const app = require('app');

describe('Authorization', function() {

  var server;

  before(function* () {
    yield db.loadDb(fixtures);

    // app.listen() uses a random port,
    // which superagent gets as server.address().port
    // so that every run will get it's own port
    server = app.listen();
  });

  describe('patch', function() {

    it('saves the user', function(done) {
      request(server)
        .patch('/users/me')
        .set('X-Test-User-Id', fixtures.User[0]._id)
        .send({
          displayName: "test"
        })
        .end(function(err, res) {
          res.body.displayName.should.exist;
          done(err);
        });
    });

    it('fails is a required field gets emptied or the email is non-unique', function(done) {
      request(server)
        .patch('/users/me')
        .set('X-Test-User-Id', fixtures.User[0]._id)
        .send({
          displayName: "",
          email: "tester@mail.com",
          gender: "Cyborg"
        })
        .end(function(err, res) {
          res.body.errors.displayName.should.exist;
          res.body.errors.email.should.exist;
          res.body.errors.gender.should.exist;
          done(err);
        });
    });

  });

  describe('get', function() {

    it("returns public user info", function(done) {
      request(server)
        .get('/users/me')
        .set('X-Test-User-Id', fixtures.User[0]._id)
        .send()
        .end(function(err, res) {
          res.body.displayName.should.eql("test");
          done(err);
        });

    });

  });

  describe('delete', function() {

    it("deletes all user fields", function(done) {
      request(server)
        .del('/users/me')
        .set('X-Test-User-Id', fixtures.User[0]._id)
        .send()
        .expect(200, done);

    });

  });


});
