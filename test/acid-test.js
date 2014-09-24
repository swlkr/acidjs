var chai = require('chai'),
    expect = chai.expect,
    acid = require('../lib/acid')({
      host: 'localhost',
      user: 'postgres',
      password: '',
      database: 'acidjs'
    }),
    Model = require('../lib/model');

describe('acid', function() {
  describe('.Model', function() {
    var tableName = 'tableName';
    var model = acid.Model(tableName);

    it('should return a function', function() {
      var type = typeof(model);
      expect(type).to.equal('function');
    });

    it('should set the primary key', function() {
      var model = acid.Model(tableName, 'otherId');
      expect(model.primaryKey).to.equal('otherId');
    });

    it('should set the primary key to id by default', function() {
      var model = acid.Model(tableName);
      expect(model.primaryKey).to.equal('id');
    });
  });
});
