// HELPER FUNCTIONS

let randomID = function generateRandomString() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const getURLsForUser = (id, urlDatabase) => {
  let userURLs = new Object();
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLs[url] = {longURL: urlDatabase[url].longURL};
    }
  }
  return userURLs;
};

const addUser = (usersDatabase, email, password) => {
  const userID = randomID();
  const newUser = {
    id: userID,
    email,
    password
  };
  usersDatabase[userID] = newUser;
  return userID;
};

const getUserByEmail = function(email, database) {
  let user;
  for (let eachUser in database) {
    if (database[eachUser].email === email) {
      user = database[eachUser];
    }
  }
  return user;
};




module.exports = {
  randomID,
  getURLsForUser,
  addUser,
  getUserByEmail
};