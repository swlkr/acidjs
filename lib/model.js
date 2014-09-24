var sql = require('sql-bricks'),
    q = require('q'),
    pg = require('pg'),
    select = sql.select,
    insert = sql.insert,
    update = sql.update;

function Model(table, connectionString, primaryKey) {
  this.table = table;
  this.connectionString = connectionString;
  this.attributes = {};
  this.primaryKey = primaryKey || 'id';
}

Model.define = function(table, connectionString, primaryKey) {
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

  return definition;
};

Model.prototype.get = function(id) {
  var whereClause = {};
  whereClause[this.primaryKey] = id;
  var query = select().from(this.table).where(whereClause).toParams();

  var deferred = q.defer();
  pg.connect(this.connectionString, function(err, client, done) {
    if(err) {
      deferred.reject(new Error(err));
    }

    client.query(query, function(err, result) {
      done();

      if(err) {
        deferred.reject(new Error(err));
      }
      else {
        deferred.resolve(result.rows[0]);
      }
    });
  });

    return deferred.promise;
};

Model.prototype.save = function() {
  var query = insert(this.table).values(this.attributes).returning('*').toParams();

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