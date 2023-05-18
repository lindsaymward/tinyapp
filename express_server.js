const express = require('express');
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

const users = {
  user1: {
    id: "user1",
    email: "a@a.com",
    password: bcrypt.hashSync("1111", 10)
  },
  user2: {
    id: "user2",
    email: "b@b.com",
    password: bcrypt.hashSync("2222", 10)
  }
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user1"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const userId = req.session.user_id;
  const templateVars = { user: users[userId] };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const userId = req.session.user_id;
  const templateVars = { user: users[userId] };
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.send('<p>Please log in or register.</p>');
  }
  const userURL = getURLForUser(userId);
  const templateVars = { urls: userURL, user: users[userId] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[userId] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.send("Please login to see this page.");
  }
  const userURL = getURLForUser(userId);
  if (!userURL[req.params.id]) {
    return res.send("This URL does not exist in your account.");
  }
  const templateVars = { urls: userURL, id: req.params.id, user: users[userId] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send("Short URL does not exist. Please login and create it first.");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email);
  if (!user) {
    return res.status(403).send("User not found. Please register first.");
  }
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(403).send("Invalid password.");
  }
  req.session.user_id = user.id;
  return res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const user = req.body;
  if (!user.email || !user.password) {
    return res.status(400).send('Please enter an email and password');
  }
  if (getUserByEmail(user.email)) {
    return res.status(400).send('Unable to register. Please try a different e-mail.');
  }
  const hashedPassword = bcrypt.hashSync(user.password, 10);
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: user.email,
    password: hashedPassword
  };
  console.log('registration password: ', users[userId].password);
  req.session.user_id = userId;
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.send("Please login to use TinyApp");
  }
  let id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send("Please login to use TinyApp");
  }

  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("That shortened URL does not exist.");
  }

  const userURL = getURLForUser(req.session.user_id);
  if (!userURL[req.params.id]) {
    return res.status(401).send("That URL is not a part of your account.")
  }

  urlDatabase[req.params.id].longURL = req.body.newURL;
  res.redirect(`/urls`);
});

app.post("/urls/:id/delete", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send("Please login to use TinyApp");
  }

  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("That shortened URL does not exist.");
  }

  const userURL = getURLForUser(req.session.user_id);
  if (!userURL[req.params.id]) {
    return res.status(401).send("That URL is not a part of your account.")
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortURL = '';
  for (let i = 0; i < 6; i++) {
    shortURL += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return shortURL;
}

function getUserByEmail(email) {
  for (const existingUser in users) {
    if (email === users[existingUser].email) {
      return users[existingUser];
    }
  }
  return null;
}

function getURLForUser(userID) {
  if (!userID) {
    return null;
  }
  const id = userID;
  const userDatabase = {};
  for (const entry in urlDatabase) {
    if (urlDatabase[entry].userID === id) {
      userDatabase[entry] = {
        longURL: urlDatabase[entry].longURL,
        userID: id
      };
    }
  }
  if (Object.keys(userDatabase).length === 0) {
    return null;
  }
  return userDatabase;
}