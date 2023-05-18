function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortURL = '';
  for (let i = 0; i < 6; i++) {
    shortURL += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return shortURL;
}

function getUserByEmail(email, database) {
  for (const existingUser in database) {
    if (email === database[existingUser].email) {
      return database[existingUser];
    }
  }
  return null;
}

function getURLForUser(userID, database) {
  if (!userID) {
    return null;
  }
  const id = userID;
  const userDatabase = {};
  for (const entry in database) {
    if (database[entry].userID === id) {
      database[entry] = {
        longURL: database[entry].longURL,
        userID: id
      };
    }
  }
  if (Object.keys(userDatabase).length === 0) {
    return null;
  }
  return userDatabase;
}

module.exports = { generateRandomString, getUserByEmail, getURLForUser };