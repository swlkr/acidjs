var q = require("q"),
    sql = require("psqljs"),
    database = require("./database");

var acid = function(connection) {
  return {
    insert: function(table, obj) {
      var deferred = q.defer();

      var query = sql.insert(table, obj).returning().toQuery();

      database.query(connection, query, function(error, result) {
        if(error) {
          deferred.reject(error);
        } else {
          deferred.resolve(result);
        }
      });

      return deferred.promise;
    },
    where: function() {
      var deferred = q.defer();

      var table = [].shift.apply(arguments);

      var query = sql.select().from(table).where.apply(sql, arguments);

      database.query(connection, query, function(error, result) {
        if(error) {
          deferred.reject(error);
        } else {
          deferred.resolve(result);
        }
      });

      return deferred.promise;
    },
    update: function() {
      var deferred = q.defer();

      var table = [].shift.apply(arguments);
      var obj = [].shift.apply(arguments);

      var query = sql.update(table, obj).where.apply(sql, arguments).returning().toQuery();

      database.query(connection, query, function(error, result) {
        if(error) {
          deferred.reject(error);
        } else {
          deferred.resolve(result);
        }
      });

      return deferred.promise;
    },
    delete: function() {
      var deferred = q.defer();

      var table = [].shift.apply(arguments);

      var query = sql.delete(table).where.apply(sql, arguments).toQuery();

      database.query(connection, query, function(error, result) {
        if(error) {
          deferred.reject(error);
        } else {
          deferred.resolve(result);
        }
      });

      return deferred.promise;
    },
    sql: function(text, values) {
      var deferred = q.defer();

      database.query(connection, {text: text, values: values}, function(error, result) {
        if(error) {
          deferred.reject(error);
        } else {
          deferred.resolve(result);
        }
      });

      return deferred.promise;
    }
  };
};

module.exports = acid;
