const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')
const { randomID, getURLsForUser, addUser, getUserByEmail } = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

app.set("view engine", "ejs");



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
}

// GET
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
  // if they're logged in, they have to see their own urls. 
  const templateVars = {
    // Lookup the user object in the users object using the user_id cookie value
    // Users Can Only See Their Own Shortened URLs
    user: users[req.session.user_id],
    urls: getURLsForUser([req.session.user_id][0], urlDatabase),
    // userID: urlDatabase[req.session["user_id"]].userID
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  // If someone is not logged in when trying to access /urls/new, 
  // redirect them to the login page.
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
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render("register");
})

app.get("/login", (req, res) => {
  res.render("login");
})

 


// POST
// Delete key: value pair corresponding to shortURL
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
  //take the new long URL in the edit bar, and assign it for the same short URL
  // if (req.session.user_id === urlDatabase[req.params.id].userID) {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  // }
  res.redirect("/urls");
  // res.send("Access denied.");
});
 
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let foundUser;

  if (!getUserByEmail(email, users)) {
    res.send('403: User does not exists');
  } 

  foundUser = getUserByEmail(email, users);

  if (foundUser) {
    if (!bcrypt.compareSync(password, foundUser.password)) {
      res.send('403: Password is incorrect');
    }
    req.session.user_id = foundUser.id;
    res.redirect("urls");
  } 
})

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
})


// Adds a user to the database form the register page, and adds the userID to the cookie.
// When redirected to the My URLs page, we stay logged in because the user is now added to the users object. 
app.post("/register", (req, res) => { 
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  // If the e-mail or password are empty strings, 
  if (email === '' || password === '') {
    res.send('400: Email or password missing');
  }

  // Or if email is already in the users object,
  if (getUserByEmail(email, users)) {
    res.send('400: User already exists');
  } 
  
  let userID = addUser(users, email, hashedPassword);
  
  req.session.user_id = userID;
  res.redirect("urls");
})




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); 

