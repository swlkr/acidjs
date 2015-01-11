var sql = require('psqljs'),
    q = require('q'),
    pg = require('pg');

function Record(model, attributes) {
  this._attributes = attributes || {};
  this._model = model;
  this.errors = [];

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

Record.prototype.valid = function() {
  var columns = this._model._columns;
  for(var i = 0; i !== columns.length; i++) {
    var column = columns[i];

    if(column.required &&
      (this[column.name] === null ||
       this[column.name] === undefined)) {
      this.errors.push(column.invalid !== undefined ? column.invalid : column.name + ' is required');
    }

    if(column.length &&
       this[column.name] &&
       parseInt(this[column.name].length, 10) >= parseInt(column.length, 10)) {
      this.errors.push(column.invalid !== undefined ? column.invalid : column.name + ' needs to be at least ' + column.length + ' characters long');
    }
  }

  return this.errors.length === 0;
};

Record.prototype.save = function() {
  var query = {};

  if(this._isNew) {
    query = sql.insert(this._model._table, getAttributes(this)).returning().toQuery();
  } else {
    var changed = diff(this._attributes, this);
    query = sql.update(this._model._table, changed).where(this._model._primaryKey + ' = ?', this[this._model._primaryKey]).returning().toQuery();
  }

  var model = this._model;
  var deferred = q.defer();
  pg.connect(this._model._connectionString, function(err, client, done) {
    if(err) {
      deferred.reject(err);
      return deferred.promise;
    }

    client.query(query, function(err, result) {
      done();

      if(err) {
        deferred.reject(err);
      } else {
        deferred.resolve(new Record(model, result.rows[0]));
      }
    });
  });

  return deferred.promise;
};

Record.prototype.destroy = function () {
  var query = sql.delete(this._model._table).where(this._model._primaryKey + ' = ?', this[this._model._primaryKey]).toQuery();

  var deferred = q.defer();
  pg.connect(this._model._connectionString, function(err, client, done) {
    if(err) {
      deferred.reject(err);
      return deferred.promise;
    }

    client.query(query, function(err, result) {
      done();

      if(err) {
        deferred.reject(err);
      } else {
        deferred.resolve(result.rowCount == 1);
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

function getAttributes(obj) {
  var attrs = {};

  for(var key in obj._attributes) {
    attrs[key] = obj[key];
  }

  return attrs;
}

module.exports = Record;
