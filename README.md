# acid.js
_A simple postgres library_

Built on top of [pg](https://github.com/brianc/node-postgres) and [psqljs](https://github.com/swlkr/psqljs)

[![Build Status](https://travis-ci.org/swlkr/acid.svg?branch=master)](https://travis-ci.org/swlkr/acid)

## Install

```bash
$ npm install --save acidjs
```

## Examples

```js
// Require the module
var acid = require("acidjs")("postgres://postgres:@localhost:5432/database");
```
## Create a table
```bash
$ psql -c "create table users (id bigserial primary key, email text not null, created_at timestamp without time zone default (now() at time zone "utc"));"
```

## Insert a record
```js
var tables = {
  users: "users"
};

acid
.insert(tables.users, {email: "test@example.com"});
.then(function(rows) {
  /*
    rows === [
      {
        id: "1",
        email: "test@example.com",
        created_at: ...
      }
    ]
  */
});
```

## Find a record with a where clause
```js
acid
.where(tables.users, "id = $1", "1")
.then(function(rows) {
  /*
    rows === [
      {
        id: "1",
        email: "test@example.com",
        created_at: ...
      }
    ]
  */
});
```
## Update a record
```js
acid
.update(tables.users, {name: "Ryan Dahl"}, "id = $1", "1")
.then(function(rows) {
  /*
    rows === [
      {
        id: "1",
        name: "Ryan Dahl",
        created_at: ...
      }
    ]
  */
})
```

## Delete a record
```js
acid
.delete(tables.users, "id = $1", "1")
.then(function(rows) {
  // rows == []
});
```

## Run arbitrary sql
```js
acid
.sql("select * from user_defined_function($1)", ["value"])
.then(function(rows) {
  /*
    rows === [
      {
        ... whatever data
      }
    ]
  */
})
```

## Tests

```bash
# Set up the database
$ psql -c "create user postgres createdb;"
$ psql -c "create database postgres;"
$ psql -c "create database acidjs;" -U postgres
$ npm test
```
