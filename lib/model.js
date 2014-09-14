var sql = require('sql'),
    q = require('q'),
    pg = require('pg');

function Model(tableName, columns, connectionString) {
  this.tableName = tableName;
  this.columns = columns;
  this.connectionString = connectionString;
  this.attributes = {};
  this.table = sql.define({
    name: tableName,
    columns: columns
  });
}

Model.new = function(tableName, columns, connectionString) {
  var modelInstance = new Model(tableName, columns, connectionString);

  var model = function(attributes) {
    if(attributes === null || typeof(attributes) !== 'object') {
      throw new Error('Cannot build a record for table ' + modelInstance.tableName + ' without an object');
    }

    modelInstance.attributes = attributes;
    var keys = Object.keys(attributes);
    keys.map(function(k) { modelInstance[k] = attributes[k]; });

    return modelInstance;
  };

  return model;
};

Model.prototype.save = function() {
  var query = this.table.insert(this.attributes).toQuery();

  var deferred = q.defer();
  pg.connect(this.connectionString, function(err, client, done) {
    if(err) {
      deferred.reject(new Error(err));
    }

    client.query(query, function(err, result) {
      done();

      if(err) {
        deferred.reject(new Error(err));
      } else {
        deferred.resolve(result);
      }
    });
  });

  return deferred.promise;
};

module.exports = Model;