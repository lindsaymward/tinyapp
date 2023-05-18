const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortURL = '';
  for (let i = 0; i < 6; i++) {
    shortURL += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return shortURL;
};

const getUserByEmail = (email, database) => {
  for (const existingUser in database) {
    if (email === database[existingUser].email) {
      return database[existingUser];
    }
  }
  return null;
};

const getURLForUser = (user, database) => {
  if (!user) {
    return null;
  }
  const id = user;
  const userDatabase = {};
  for (const entry in database) {
    if (database[entry].userID === id) {
      userDatabase[entry] = {
        longURL: database[entry].longURL,
        userID: id
      };
    }
  }
  return userDatabase;
};

module.exports = { generateRandomString, getUserByEmail, getURLForUser };