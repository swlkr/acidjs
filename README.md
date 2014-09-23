# Acid
_A minimal postgres ORM for nodejs_

Built on top of [pg](https://github.com/brianc/node-postgres) and [sql-bricks](https://github.com/CSNW/sql-bricks)

[![Build Status](https://travis-ci.org/swlkr/acid.svg?branch=master)](https://travis-ci.org/swlkr/acid)

## Examples

```js
// Require the module
var acid = require('acid')({
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

// Insert a record
var user = new User({email: 'test@example.com'});
user.save()
.then(function(result) {
  /*
  result = {
    id: '1',
    email: 'test@example.com',
    createdat: Sun Sep 14 2014 23:03:13 GMT-0700 (PDT)
  }
  */
})
.fail(function(error) {
  console.log(error);
})

// Find a record by primary key (first column name in model definition)
User.get(1)
.then(function(result) {
  /*
  result = {
    id: '1',
    email: 'test@example.com',
    createdat: Sun Sep 14 2014 23:03:13 GMT-0700 (PDT)
  }
  */
})
.fail(function(error) {
  console.log(error);
})
```

## Tests

```bash
# Set up the database
$ psql -c "create user postgres createdb;"
$ psql -c "create database postgres;"
$ psql -c "create database acidjs;" -U postgres
$ make test
```