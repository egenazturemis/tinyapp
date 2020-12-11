// HELPER FUNCTIONS

let randomID = function generateRandomString() {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const getURLsForUser = (id, urlDatabase) => {
let userURLs = new Object();
for (let url in urlDatabase) {
  if (urlDatabase[url].userID === id) {
    userURLs[url] = {longURL: urlDatabase[url].longURL};
  }
}
// return urls where the userID is equal to the id of the currently logged-in user.
return userURLs;
}

// A helper function to add a user to the database form the register page, and return the userID for that user. 
// The route that's using this function will populate the usersDatabase variable based on what database we wanna add it in.  
const addUser = (usersDatabase, email, password) => {
const userID = randomID();
const newUser = {
  id: userID,
  email,
  password
}
usersDatabase[userID] = newUser;
return userID;
}

const getUserByEmail = function(email, database) {
let user;
for (let eachUser in database) {
  if(database[eachUser].email === email) {
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
} 