var data = require('test/data');
var mongoose = require('mongoose');
var co = require('co');

describe('User', function() {
  before(function *() {
    yield data.createEmptyDb
  });

  var User = mongoose.models.User;

  it('given bad email errors on save', function*() {
    var user = new User({
      email: "BAD",
      username: "John",
      password: "123"
    });

    user.persist()(function(err) {
      err.name.should.equal('ValidationError');
      err.errors.email.value.should.equal(user.get('email'));
    });

  });

  it('requires password & email & username', function*() {

    [
      {
        email: "my@gmail.com",
        username: "John"
      },
      {
        email: "my@gmail.com",
        password: "John"
      },
      {
        username: "John",
        password: "****"
      }
    ].map(function(data) {
        var user = new User(data);
        user.persist()(function(err) {
          err.name.should.equal('ValidationError');
        });
      });

  });

  it('autogenerates salt and hash', function *() {

    var user = new User({
      email: "a@b.ru",
      username: "John",
      password: "pass"
    });

    user.get('salt').should.not.be.empty;
    user.get('passwordHash').should.not.be.empty;
    user.checkPassword("pass").should.be.true;

  });

  it('requires unique email', function *() {

    var data = {
      username: "nonunique",
      email: "nonunique@b.ru",
      password: "pass"
    };

    yield new User(data).persist();
    try {
      yield new User(data).persist();
      throw new Error("Same email is saved twice!");
    } catch(err) {
      err.code.should.equal(11000); // unique index is checked by mongo
    }

  });
});
