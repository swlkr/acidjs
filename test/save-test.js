var chai = require('chai'),
    expect = chai.expect,
    chaiAsPromised = require('chai-as-promised'),
    acid = require('../lib/acid')({
      host: 'localhost',
      user: 'postgres',
      password: '',
      database: 'acidjs',
      port: 5432
    });

chai.use(chaiAsPromised);

describe('Record', function() {
  describe('#save', function() {
    before(function() {
      return acid.Query("create table users (id bigserial primary key, email text unique not null, createdAt timestamp without time zone default (now() at time zone 'utc'));");
    });

    after(function() {
      return acid.Query('drop table users;');
    });

    it('should save a new record to the database', function() {
      var User = acid.Model('users');
      var user = new User({email: 'test@test.com'});
      return expect(user.save()).to.eventually.include.keys('id');
    });

    it('should save an existing record to the database', function() {
      var User = acid.Model('users');
      var user = new User({email: 'update@example.com'});
      return user.save().then(function(u) {
        u.email = 'updated_email@example.com';
        return expect(u.save()).to.eventually.have.deep.property('email', u.email);
      });
    });

    it('should handle chained promises', function() {
      var User = acid.Model('users');
      var email = 'updated@example.com';
      var user = new User({email: 'new@example.com'});
      return user.save().then(function(u) {
        u.email = email;
        return u.save();
      })
      .then(function(user) {
        return expect(user).to.have.deep.property('email', email);
      });
    });

    it('should save any newly assigned properties', function() {
      var User = acid.Model('users');
      var user = new User({email: 'test1@example.com'});
      user.email = 'test2@example.com';
      return expect(user.save()).to.eventually.have.deep.property('email', user.email);
    });
  });
});
