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
  describe('#destroy', function() {
    before(function() {
      return acid.Query("create table users (id bigserial primary key, email text unique not null, createdAt timestamp without time zone default (now() at time zone 'utc'));");
    });

    after(function() {
      return acid.Query('drop table users;');
    });

    it('should remove a record from the database', function() {
      var User = acid.Model('users');
      var user = new User({email: 'test@test.com'});
      return user.save().then(function(user) {
        return expect(user.destroy()).to.eventually.equal(true);
      });
    });
  });
});
