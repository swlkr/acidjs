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

describe('Model', function() {
  describe('.where', function() {
    var User = acid.Model('users');

    before(function() {
      return acid.Query("create table users (id bigserial primary key, email text unique not null, name text, job text, createdAt timestamp without time zone default (now() at time zone 'utc'));").then(function(result) {
        return acid.Query("insert into users (email, name, job) values ('test@test.com', 'steve', null), ('test@example.com', 'steve', 'software engineer'), ('test1@example.com', 'steve', 'software engineer')");
      });
    });

    after(function() {
      return acid.Query('drop table users;');
    });

    it('should retrieve records meeting the given criteria', function() {
      return expect(User.where('email = ?', 'test@example.com').run()).to.eventually.have.length(1);
    });

    it('should handle multiple parameters in the where clause', function() {
      return expect(User.where('name = ? and job = ?', 'steve', 'software engineer').run()).to.eventually.have.length(2);
    });
  });
});