var sql = require('psqljs'),
    q = require('q'),
    pg = require('pg'),
    Record = require('./record');

function Model(table, connectionString, primaryKey) {
  this._table = table;
  this._connectionString = connectionString;
  this._primaryKey = primaryKey || 'id';
  this._query = null;
  this._methods = {};
  this._columns = [];
}

Model.createModel = function(table, connectionString, primaryKey) {

  var model = new Model(table, connectionString, primaryKey);

  // user's model definition
  var definition = function(attributes) {
    if(attributes === null || typeof(attributes) !== 'object') {
      throw new Error('Cannot build a record for table ' + model._table + ' without an object');
    }

    return new Record(model, attributes);
  };

  definition.define = function(key, fn) {
    model._methods[key] = fn;
  };

  definition.get = function(id) {
    model._query = sql.select().from(model._table).where(model._primaryKey + ' = ?', id);

    var deferred = q.defer();
    model.run().then(function(records) {
      if(records.length > 0) {
        deferred.resolve(records[0]);
      } else {
        deferred.resolve({});
      }
    }, deferred.reject);

    return deferred.promise;
  };

  definition.where = function(str) {
    model._query = sql.select().from(model._table).where.apply(sql, arguments);
    return model;
  };

  definition.all = function() {
    model._query = sql.select().from(model._table);
    var deferred = q.defer();
    model.run().then(function(records) {
      return deferred.resolve(records);
    }, deferred.reject);
    return deferred.promise;
  };

  return definition;
};

Model.prototype.run = function() {
  var deferred = q.defer();
  var query = this._query;

  this._query = null;

  var model = this;
  pg.connect(this._connectionString, function(err, client, done) {
    if(err) {
      deferred.reject(err);
      return deferred.promise;
    }

    client.query(query.toQuery(), function(err, result) {
      done();

      if(err) {
        deferred.reject(err);
        return deferred.promise;
      }

      var records = [];
      for(var i = 0; i != result.rows.length; i++) {
        records.push(new Record(model, result.rows[i]));
      }
      deferred.resolve(records);
    });
  });

  return deferred.promise;
};

module.exports = Model;
