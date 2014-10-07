var sql = require('psqljs'),
    q = require('q'),
    pg = require('pg');

function Model(table, connectionString, primaryKey) {
  this.table = table;
  this.connectionString = connectionString;
  this.attributes = {};
  this.primaryKey = primaryKey || 'id';
  this.query = null;
}

Model.createModel = function(table, connectionString, primaryKey) {
  var self = new Model(table, connectionString, primaryKey);

  // user's model definition
  var definition = function(attributes) {
    if(attributes === null || typeof(attributes) !== 'object') {
      throw new Error('Cannot build a record for table ' + self.table + ' without an object');
    }

    self.attributes = attributes;
    var keys = Object.keys(attributes);
    keys.map(function(k) { self[k] = attributes[k]; });

    return self;
  };

  // Hack to call Model.prototype methods after definition is instantiated
  definition.__proto__ = self;

  definition.define = function(key, fn) {
    var proto = Object.getPrototypeOf(this);
    proto[key] = fn;
  };

  return definition;
};

Model.prototype.run = function() {
  var deferred = q.defer();
  var query = this.query;
  this.query = null;
  pg.connect(this.connectionString, function(err, client, done) {
    if(err) {
      deferred.reject(new Error(err));
    }

    client.query(query.toQuery(), function(err, result) {
      done();

      if(err) {
        deferred.reject(new Error(err));
      }
      else {
        deferred.resolve(result.rows);
      }
    });
  });

  return deferred.promise;
};

Model.prototype.where = function(str) {
  this.query = sql.select().from(this.table).where.apply(sql, arguments);

  return this;
};

Model.prototype.get = function(id) {
  this.query = sql.select().from(this.table).where(this.primaryKey + ' = ?', id);

  var deferred = q.defer();
  this.run().then(function(rows) {
    deferred.resolve(rows[0]);
  }, deferred.reject);

  return deferred.promise;
};

Model.prototype.save = function() {
  var query = sql.insert(this.table, this.attributes).returning().toQuery();

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
        deferred.resolve(result.rows[0]);
      }
    });
  });

  return deferred.promise;
};

module.exports = Model;
