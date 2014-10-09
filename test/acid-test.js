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
});
