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

describe('Model', function() {
  describe('.define', function() {
    it('should allow the user to define a function', function() {
      var User = acid.Model('users');
      User.define('isValid', function() {
        return this.email !== null;
      });
      var user = new User({email: 'email@test.com'})
      expect(user.isValid()).to.equal(true);
    });
  });
});
