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
  var self = new Model(tableName, columns, connectionString);

  var record = function(attributes) {
    if(attributes === null || typeof(attributes) !== 'object') {
      throw new Error('Cannot build a record for table ' + self.tableName + ' without an object');
    }

    self.attributes = attributes;
    var keys = Object.keys(attributes);
    keys.map(function(k) { self[k] = attributes[k]; });

    return self;
  };

  record.get = function(id) {
    var query = self.table
    .select(self.table.star())
    .where(
      self.table[self.columns[0]].equals(id)
    )
    .toQuery();

    var deferred = q.defer();
    pg.connect(self.connectionString, function(err, client, done) {
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

  return record;
};

Model.prototype.save = function() {
  var query = this.table.insert(this.attributes).returning(this.table.star()).toQuery();

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