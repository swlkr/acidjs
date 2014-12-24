# Acid
_A minimal postgres ORM for nodejs_

Built on top of [pg](https://github.com/brianc/node-postgres) and [psqljs](https://github.com/swlkr/psqljs)

[![Build Status](https://travis-ci.org/swlkr/acid.svg?branch=master)](https://travis-ci.org/swlkr/acid)

## Install

```bash
$ npm install --save acidjs
```

## Examples

```js
// Require the module
var acid = require('acidjs')({
  host: 'localhost',
  user: 'postgres',
  password: '',
  database: 'acidjs',
  port: 5432
});
```
```bash
# Create a table
$ psql -c "create table users (id bigserial primary key, email text not null, createdAt timestamp without time zone default (now() at time zone 'utc'));"
```
```js
// Define a model
var User = acid.Model('users');

// Define a model with a primary key other than id
var User = acid.Model('users', 'userId');

// Define a function or three
User.define('isAuthenticated', function(pass, success, failure) {
  bcrypt.compare(pass, this.password, function(err, res) {
    if(res === true) {
      success();
    } else {
      failure();
    }
  });
});

User.define('isValid', function() {
  return validator.isEmail(this.email) && this.password && this.password.length >= 7;
});

User.define('hashPassword', function() {
  this.password = bcrypt.hashSync(this.password, 7);
});

// Insert a record
var user = new User({email: 'test@example.com'});
user.save()
.then(function(user) {
  /*
  user = {
    id: '1',
    email: 'test@example.com',
    createdat: Sun Sep 14 2014 23:03:13 GMT-0700 (PDT)
  }
  */
})

// Find a record by primary key (id by default)
User.get(1)
.then(function(user) {
  /*
  user = {
    id: '1',
    email: 'test@example.com',
    createdat: Sun Sep 14 2014 23:03:13 GMT-0700 (PDT)
  }
  */
})

// Find a record using where
User.where('email = ?', 'test@example.com').run()
.then(function(user) {
  /*
    user = [{
      id: '1',
      email: 'test@example.com',
      createdat: Sun Sep 14 2014 23:03:13 GMT-0700 (PDT)
    }]
  */
})

// Update a record
User.get(1)
.then(function(user) {
  user.name = 'Ryan Dahl';
  return user.save();
})
.then(function(user) {
  /*
    user = {
      id: '1',
      name: 'Ryan Dahl',
      createdat: Sun Sep 14 2014 23:03:13 GMT-0700 (PDT)
    }
  */
})

// Delete a record
User.get(1)
.then(function(user) {
  return user.destroy();
})
.then(function(deleted) {
  // deleted = true
});
```

## Tests

```bash
# Set up the database
$ psql -c "create user postgres createdb;"
$ psql -c "create database postgres;"
$ psql -c "create database acidjs;" -U postgres
$ make test
```
