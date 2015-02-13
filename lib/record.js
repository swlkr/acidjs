var sql = require('psqljs'),
    q   = require('q'),
    pg  = require('pg');

function Record(model, attributes) {
  var _attributes = attributes || {};
  var _model = model;
  var self = this;
  this.errors = [];

  for(var _attr in _attributes) {
    this[_attr] = _attributes[_attr];
  }

  var keys = Object.keys(_attributes);
  var _isNew = keys.indexOf(_model._primaryKey) === -1;

  for(var _method in _model._methods) {
    if (this[_method] === undefined) {
      this[_method] = _model._methods[_method];
    }
  }

  function diff(obj1, obj2) {
    var changed = {};

    for(var key in obj1) {
      if(obj1[key] !== obj2[key]) {
        changed[key] = obj2[key];
      }
    }

    return changed;
  }

  function getAttributes() {
    return Object.keys(_attributes).reduce(function(previous, current) {
        previous[current] = self[current];
        return previous;
    }, {});
  }

  this.save = function() {
    var query = {};

    if(_isNew) {
      query = sql.insert(_model._table, getAttributes()).returning().toQuery();
    } else {
      var changed = diff(_attributes, self);
      query = sql.update(_model._table, changed).where(_model._primaryKey + ' = ?', self[_model._primaryKey]).returning().toQuery();
    }

    var model = _model;
    var deferred = q.defer();
    pg.connect(_model._connectionString, function(err, client, done) {
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

  this.valid = function() {
    var columns = _model._columns;
    for(var i = 0; i !== columns.length; i++) {
      var column = columns[i];

      if(column.required &&
        (self[column.name] === null ||
         self[column.name] === undefined)) {
        self.errors.push(column.invalid !== undefined ? column.invalid : column.name + ' is required');
      }

      if(column.length &&
         self[column.name] &&
         parseInt(self[column.name].length, 10) <= parseInt(column.length, 10)) {
        self.errors.push(column.invalid !== undefined ? column.invalid : column.name + ' needs to be at least ' + column.length + ' characters long');
      }
    }

    return self.errors.length === 0;
  };

  this.destroy = function() {
    var query = sql.delete(_model._table).where(_model._primaryKey + ' = ?', self[_model._primaryKey]).toQuery();

    var deferred = q.defer();
    pg.connect(_model._connectionString, function(err, client, done) {
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
}

Record.prototype.valid = function() {
  return this.valid();
};

Record.prototype.save = function() {
  return this.save();
};

Record.prototype.destroy = function () {
  return this.destroy();
};

module.exports = Record;
