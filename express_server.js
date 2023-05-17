const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const users = {
  user1: {
    id: "user1",
    email: "a@a.com",
    password: "1111"
  },
  user2: {
    id: "user2",
    email: "b@b.com",
    password: "2222"
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  const userId = req.cookies.user_id;
  const templateVars = { user: users[userId] };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.cookies.user_id;
  const templateVars = { user: users[userId] };
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  const templateVars = { urls: urlDatabase, user: users[userId] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;
  const templateVars = { user: users[userId] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id;
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[userId] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email);
  if (!user) {
    res.status(403).send("User not found. Please register first.")
  }
  if (user.password !== req.body.password) {
    res.status(403).send("Invalid password.")
  }
  res.cookie('user_id', user.id);
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const user = req.body;
  if (!user.email || !user.password) {
    return res.status(400).send('Please enter an email and password');
  }
  if (getUserByEmail(user.email)) {
    return res.status(400).send('Unable to register. Please try a different e-mail.');
  }
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: user.email,
    password: user.password
  };
  res.cookie('user_id', userId);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect(`/urls`);
});

app.post("/urls/:id/delete", (req, res) => {
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