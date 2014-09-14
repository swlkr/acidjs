# Acid
_An unbelievably simple postgres ORM for nodejs_

Built on top of [pg](https://github.com/brianc/node-postgres) and [node-sql](https://github.com/brianc/node-sql)

## Examples

```js
// Require the module
var acid = require('acid')({
  host: 'localhost',
  user: 'postgres',
  password: '',
  database: 'acidjs'
});

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
user.save();
```

## Running the tests

```bash
psql -c "create user postgres createdb;"
psql -c "create database postgres;"
psql -c "create database acidjs;" -U postgres
make test
```