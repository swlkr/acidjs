var sql = require('psqljs'),
    q = require('q'),
    pg = require('pg');

function Record(model, attributes) {
  this._attributes = attributes || {};
  this._model = model;

  for(var key in this._attributes) {
    this[key] = this._attributes[key];
  }

  var keys = Object.keys(this._attributes);
  this._isNew = keys.indexOf(model._primaryKey) === -1;

  for(var key in model._methods) {
    if (this[key] === undefined) {
      this[key] = model._methods[key];
    }
  }
}

Record.prototype.save = function() {
  var query = {};

  if(this._isNew) {
    query = sql.insert(this._model._table, this._attributes).returning().toQuery();
  } else {
    var changed = diff(this._attributes, this);
    query = sql.update(this._model._table, changed).where(this._model._primaryKey + ' = ?', this[this._model._primaryKey]).returning().toQuery();
  }

  var model = this._model;
  var deferred = q.defer();
  pg.connect(this._model._connectionString, function(err, client, done) {
    if(err) {
      deferred.reject(new Error(err));
    }

    client.query(query, function(err, result) {
      done();

      if(err) {
        deferred.reject(new Error(err));
      } else {
        deferred.resolve(new Record(model, result.rows[0]));
      }
    });
  });

  return deferred.promise;
};

function diff(obj1, obj2) {
  var changed = {};

  for(var key in obj1) {
    if(obj1[key] !== obj2[key]) {
      changed[key] = obj2[key];
    }
  }

  return changed;
}

module.exports = Record;
