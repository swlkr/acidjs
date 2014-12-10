var chai = require('chai'),
    expect = chai.expect,
    acid = require('../lib/acid')({
      host: 'localhost',
      user: 'postgres',
      password: '',
      database: 'acidjs'
    });

describe('acid', function() {
  describe('.Model', function() {
    var tableName = 'tableName';
    var model = acid.Model(tableName);

    it('should return a function', function() {
      var type = typeof(model);
      expect(type).to.equal('function');
    });

    it('should set the primary key', function() {
      var Model = acid.Model(tableName, 'otherId');
      var model = new Model({});
      expect(model._model._primaryKey).to.equal('otherId');
    });

    it('should set the primary key to id by default', function() {
      var Model = acid.Model(tableName);
      var model = new Model({});
      expect(model._model._primaryKey).to.equal('id');
    });
  });

  describe('require()', function() {
    var str = 'postgres://user:password@host:3456/database';

    it('should handle a connection string', function() {
      var acidTest = require('../lib/acid')(str);
      expect(acidTest.ConnectionString()).to.equal(str);
    });

    it('should handle a json object', function() {
      var acidTest = require('../lib/acid')({host: 'host', user: 'user', password: 'password', port: '3456', database: 'database'});
      expect(acidTest.ConnectionString()).to.equal(str);
    });
  });
});
