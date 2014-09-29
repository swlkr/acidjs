var chai = require('chai'),
    expect = chai.expect,
    chaiAsPromised = require('chai-as-promised'),
    acid = require('../lib/acid')({
      host: 'localhost',
      user: 'postgres',
      password: '',
      database: 'acidjs',
      port: 5432
    }),
    Model = require('../lib/model');

chai.use(chaiAsPromised);

describe('Model', function() {
  describe('.new', function() {
    it('should return an instance of a model', function() {
      var User = acid.Model('users');
      var user = new User({email: 'hello@example.com'});
      expect(user).to.be.an.instanceof(Model);
    });

    it('should create properties', function() {
      var User = acid.Model('users');
      var user = new User({email: 'hello@example.com'});
      expect(user.email).to.equal('hello@example.com');
    });

    it('should throw an error when given an incorrect input', function() {
      var User = acid.Model('users');
      var fn = function() { new User(); };
      expect(fn).to.throw('Cannot build a record for table users without an object');
    });
  });

  describe('#save', function() {
    before(function() {
      return acid.Query("create table users (id bigserial primary key, email text unique not null, createdAt timestamp without time zone default (now() at time zone 'utc'));");
    });

    after(function() {
      return acid.Query('drop table users;');
    });

    it('should save a record to the database', function() {
      var User = acid.Model('users');
      var user = new User({email: 'test@test.com'});
      return expect(user.save()).to.eventually.include.keys('id');
    });
  });

  describe('.get', function() {
    before(function() {
      return acid.Query("create table users (id bigserial primary key, email text unique not null, createdAt timestamp without time zone default (now() at time zone 'utc'));").then(function(result) {
        return acid.Query("insert into users (email) values ('test@test.com')");
      });
    });

    after(function() {
      return acid.Query('drop table users;');
    });

    it('should get a record from the database', function() {
      var User = acid.Model('users');
    });
  });

  describe('.where', function() {
    before(function() {
      return acid.Query("create table users (id bigserial primary key, email text unique not null, createdAt timestamp without time zone default (now() at time zone 'utc'));").then(function(result) {
        return acid.Query("insert into users (email) values ('test@test.com'), ('test@example.com'), ('test1@example.com')");
      });
    });

    after(function() {
      return acid.Query('drop table users;');
    });

    it('should retrieve records meeting the given criteria', function() {
      var User = acid.Model('users');
      return expect(User.where({email: 'test@test.com'})).to.eventually.have.length(1);
    });
  });
});
