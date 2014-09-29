var sql = require('sql-bricks-postgres'),
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
  this.query = null;
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

Model.prototype.run = function() {
  var deferred = q.defer();
  var query = this.query;
  this.query = null;
  pg.connect(this.connectionString, function(err, client, done) {
    if(err) {
      deferred.reject(new Error(err));
    }

    client.query(query.toParams(), function(err, result) {
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

Model.prototype.where = function(args) {
  if(typeof(args) !== 'object') {
    throw new Error('Where only accepts json object literals');
  }
  if(this.query === null) {
    this.query = select().from(this.table).where(args);
  } else {
    this.query = this.query.where(args);
  }
  return this;
};

Model.prototype.get = function(id) {
  var whereClause = {};
  whereClause[this.primaryKey] = id;
  this.query = select().from(this.table).where(whereClause);

  var deferred = q.defer();
  this.run().then(function(rows) {
    deferred.resolve(rows[0]);
  }, deferred.reject);

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