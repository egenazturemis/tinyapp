// SERVER SETUP

const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { randomID, getURLsForUser, addUser, getUserByEmail } = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

app.set("view engine", "ejs");



// DATABASES

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "hello"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};



// GET REQUESTS

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(users);
});

app.get("/db", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: getURLsForUser([req.session.user_id][0], urlDatabase),
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }
  
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]
  };

  if (!req.session.user_id) {
    res.status(404).send('Log in to see this URL');
    return;
  }

  let shortURL = req.params.shortURL;
  let userID = urlDatabase[shortURL].userID;

  if (req.session.user_id !== userID) {
    res.status(403).send('This URL belongs to another user!');
    return;
  } else {
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(`https://${longURL}`);
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});
 


// POST REQUESTS

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let generatedShortURL = randomID();
  urlDatabase[generatedShortURL] = {longURL: req.body.longURL, userID: req.session.user_id};
  res.redirect(`/urls/${generatedShortURL}`);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls/");
});
 
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let foundUser;

  if (!getUserByEmail(email, users)) {
    res.status(403).send('User does not exists');
  }

  foundUser = getUserByEmail(email, users);

  if (foundUser) {
    if (!bcrypt.compareSync(password, foundUser.password)) {
      res.status(403).send('Password is incorrect');
    }
    req.session.user_id = foundUser.id;
    res.redirect("urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  if (email === '' || password === '') {
    res.status(400).send('Email or password missing');
  }

  if (getUserByEmail(email, users)) {
    res.status(400).send('User already exists');
  }
  
  let userID = addUser(users, email, hashedPassword);
  
  req.session.user_id = userID;
  res.redirect("urls");
});



// LISTEN PORT

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});