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
    model.run().then(function(rows) {
      if(rows.length > 0) {
        deferred.resolve(rows[0]);
      } else {
        deferred.resolve({});
      }
    }, deferred.reject)

    return deferred.promise;
  };

  definition.where = function(str) {
    model._query = sql.select().from(model._table).where.apply(sql, arguments);
    return model;
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
      deferred.reject(new Error(err));
    }

    client.query(query.toQuery(), function(err, result) {
      done();

      if(err) {
        deferred.reject(new Error(err));
      }
      else {
        var records = [];
        for(var i = 0; i != result.rows.length; i++) {
          records.push(new Record(model, result.rows[i]));
        }
        deferred.resolve(records);
      }
    });
  });

  return deferred.promise;
};

module.exports = Model;
