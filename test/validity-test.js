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
  describe('#valid', function() {
    it('should check for validity based on column attributes', function() {
      var User = acid.Model('Users');
      User.column('email', { required: true });
      User.column('password', { required: true, length: 7 });

      var user = new User({});

      return expect(user.valid()).to.equal(false);
    });

    it('should return a default error message', function() {
      var User = acid.Model('Users');
      User.column('email', { required: true });
      User.column('email', { required: true });
      User.column('password', { required: true, length: 7 });

      var user = new User({});
      user.valid();

      return expect(user.errors[0]).to.equal('email is required');
    });

    it('should return a custom error message', function() {
      var User = acid.Model('Users');
      var invalid = {
        email: 'You need to use an actual email address',
        password: 'Your password needs to be longer than 7 characters'
      };

      User.column('email', { required: true, invalid: invalid.email });
      User.column('password', { required: true, length: 7, invalid: invalid.password });

      var user = new User({});
      user.valid();

      return expect(user.errors[0]).to.equal(invalid.email);
    });
  });
});
