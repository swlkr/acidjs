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
    var columns = ['col1', 'col2'];
    var model = acid.Model(tableName, columns);

    it('should return a function', function() {
      var type = typeof(model);
      expect(type).to.equal('function');
    });
  });
});
