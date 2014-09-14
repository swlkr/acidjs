# Acid
_A minimal postgres ORM for nodejs_

Built on top of [pg](https://github.com/brianc/node-postgres) and [node-sql](https://github.com/brianc/node-sql)

![Build Status](https://travis-ci.org/swlkr/acid.svg?branch=master)

## Examples

```js
// Require the module
var acid = require('acid')({
  host: 'localhost',
  user: 'postgres',
  password: '',
  database: 'acidjs'
});
```
```bash
# Create a table
$ psql -c "create table users (id serial primary key, email text not null);"
```

```js
// Define a model
var User = acid.Model(
  'Users',
  [
    'id',
    'email'
  ]
)

// Insert a record
var user = new User({
  email: 'test@example.com'
});
user.save()
.then(function(result) {
  /*
  result = {
    id: FB2D5E27-23CE-4CB2-9274-91D3845B85D0,
    email: 'test@example.com'
  }
  */
})
.fail(function(error) {
  console.log(error);
})
```

## Tests

```bash
psql -c "create user postgres createdb;"
psql -c "create database postgres;"
psql -c "create database acidjs;" -U postgres
make test
```