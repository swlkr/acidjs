var q = require('q'),
    pg = require('pg'),
    Model = require('./model');

module.exports = function(connection) {
  var connectionString = buildConnectionString(connection);

  return {
    Model: function(table, primaryKey) {
      return Model.define(table, connectionString, primaryKey);
    },
    Query: function(query) {
      var deferred = q.defer();
      pg.connect(connectionString, function(err, client, done) {
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
    }
  };
};

function buildConnectionString(attributes) {
  return 'postgres://' + attributes.user + ':' + attributes.password + '@' + attributes.host + ':' + attributes.port + '/' + attributes.database;
}