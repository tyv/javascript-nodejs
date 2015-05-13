/* globals describe, it, before */

const db = require('lib/dataUtil');
const mongoose = require('mongoose');
const path = require('path');
const request = require('supertest');
const fixtures = require(path.join(__dirname, '../fixtures/db'));
const app = require('app');
const should = require('should');

describe('Authorization', function() {

  var server;

  before(function* () {
    yield* db.loadModels(fixtures);

    // app.listen() uses a random port,
    // which superagent gets as server.address().port
    // so that every run will get it's own port
    server = app.listen();
    server.unref();
  });

  describe('patch', function() {

    it('saves the user', function(done) {
      request(server)
        .patch('/users/me')
        .set('X-Test-User-Id', fixtures.User[0]._id)
        .set('Accept', 'application/json')
        .field('displayName', 'test') // will send as multipart
        .end(function(err, res) {
          res.body.displayName.should.exist;
          done(err);
        });
    });

    it('transloads the user photo', function(done) {
      request(server)
        .patch('/users/me')
        .set('X-Test-User-Id', fixtures.User[0]._id)
        .set('Accept', 'application/json')
        .attach('photo', path.join(__dirname, 'me.jpg'))
        .end(function(err, res) {
          if (err) return done(err);
          res.body.photo.should.startWith('http://');
          done();
        });
    });

    it('returns not all errors, but only one error if a field is wrong', function(done) {
      request(server)
        .patch('/users/me')
        .set('X-Test-User-Id', fixtures.User[0]._id)
        .set('Accept', 'application/json')
        .field('displayName', '')
        .field('email', Math.random() + "@mail.com")
        .field('gender', 'invalid')
        .expect(400)
        .end(function(err, res) {
          //console.log(res.body);
          if (err) return done(err);
          res.body.message.should.exist;
          done();
        });
    });


    it('returns a single error if an email is duplicated', function(done) {

      request(server)
        .patch('/users/me')
        .set('X-Test-User-Id', fixtures.User[0]._id)
        .set('Accept', 'application/json')
        .field('displayName', "Such mail belongs to another user")
        .field('email', "tester@mail.com")
        .field('gender', "male")
        .expect(409)
        .end(function(err, res) {

          if (err) return done(err);

          should(res.body.errors).not.exist;
          res.body.message.should.exist;
          done();
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
