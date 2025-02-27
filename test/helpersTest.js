const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    }
    assert.deepEqual(user, expectedOutput, 'Assertion failed!: getUserByEmail does not return the expected user.');
  });
  it('should return undefined if the email does not exist in the database', function() {
    const user = getUserByEmail("nonexistent@email.com", testUsers)
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput, 'Assertion failed!: email address already in database.');
  });
});