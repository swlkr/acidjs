var should = require('should'),
    acid = require('../lib/acid')({
      host: 'localhost',
      user: 'postgres',
      password: '',
      database: 'acidjs',
      port: 5432
    }),
    Model = require('../lib/model');

describe('Model', function() {
  describe('.new', function() {
    it('should return an instance of a model', function() {
      var User = acid.Model('users', ['id', 'email']);
      var user = new User({email: 'hello@example.com'});
      user.should.be.instanceOf(Model);
    });

    it('should create properties', function() {
      var User = acid.Model('users', ['id', 'email']);
      var user = new User({email: 'hello@example.com'});
      user.email.should.equal('hello@example.com');
    });

    it('should throw an error when given an incorrect input', function() {
      var User = acid.Model('users', ['id', 'email']);
      (function() {
        var user = new User();
      }).should.throw('Cannot build a record for table users without an object');
    });
  });

  describe('#save', function() {
    beforeEach(function() {
      acid.Query('drop table users;');
      acid.Query('create table users (id serial primary key, email text not null);');
    });

    it('should save a record to the database', function(done) {
      var User = acid.Model('users', ['id', 'email']);
      var user = new User({email: 'test@test.com'});
      user.save()
      .then(function(result) {
        done();
      })
      .fail(function(error) {
        done();
      });
    });
  });
});
