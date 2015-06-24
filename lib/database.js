var pg = require("pg");

var database = {
  query: function(connection, sql, callback) {
    pg.connect(connection, function(err, client, done) {
      if(err) {
        done();
        callback(err, []);
      } else {
        client.query(sql, function(error, result) {
          done();
          callback(error, (result || {}).rows);
        });
      }
    });
  }
};

module.exports = database;
