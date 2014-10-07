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
});
