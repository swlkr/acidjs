var chai = require("chai"),
    expect = chai.expect,
    chaiAsPromised = require("chai-as-promised"),
    database = require("../lib/acid")("postgres://postgres:@localhost:5432/acidjs");

    chai.use(chaiAsPromised);

describe("database", function() {
  before(function() {
    return database.sql("create table users (name text)");
  });

  after(function() {
    return database.sql("drop table users;");
  });

  describe(".insert", function() {
    it("should insert a record into the database", function() {
      return expect(
              database.insert("users", {name: "test"})
             ).to.eventually.deep.equal([{name: "test"}]);
    });
  });

  describe(".where", function() {
    before(function() {
      return database.insert("users", {name: "some user"});
    });

    it("should retrieve a record from the database", function() {
      return expect(
              database.where("users", "name = $1", "some user")
             ).to.eventually.deep.equal([{name: "some user"}]);
    });
  });

  describe(".update", function() {
    before(function() {
      return database.insert("users", {name: "update me"});
    });

    it("should update a record in the database", function() {
      return expect(
              database.update("users", {name: "updated"}, "name = $2", "update me")
             ).to.eventually.deep.equal([{name: "updated"}]);
    });
  });

  describe(".delete", function() {
    before(function() {
      return database.insert("users", {name: "delete me"});
    });

    it("should delete a record from the database", function() {
      return expect(
              database.delete("users", "name = $1", "delete me")
             ).to.eventually.deep.equal([]);
    });
  });


});
