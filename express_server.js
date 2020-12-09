const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
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
}


let randomID = function generateRandomString() {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}



// GET
app.get("/", (req, res) => {
  res.redirect("/urls");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    // Lookup the user object in the users object using the user_id cookie value
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render("register");
})




// POST
// Delete key: value pair corresponding to shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let generatedShortURL = randomID();
  urlDatabase[generatedShortURL] = req.body.longURL;
  res.redirect(`/urls/${generatedShortURL}`);
});

app.post("/urls/:id", (req, res) => {
  //take the new long URL in the edit bar, and assign it for the same short URL
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
})

// A helper function to add a user to the database form the register page, and return the userID for that user. 
// The route that's using this function will populate the usersDatabase variable based on what database we wanna add it in.  
const addUser = (usersDatabase, email, password) => {
  const userID = randomID();
  const newUser = {
    id: userID,
    email,
    password
  }
  users[userID] = newUser;
  return userID;
}

// Adds a user to the database form the register page, and adds the userID to the cookie.
// When redirected to the My URLs page, we stay logged in because the user is now added to the users object. 
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = addUser(users, email, password);
  res.cookie('user_id', userID);
  res.redirect("urls");
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
