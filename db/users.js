/* eslint-disable no-useless-catch */
const client = require("./client");
const bcryptjs = require("bcryptjs");
// const { de } = require("faker/lib/locales");

// * Passing all tests
async function createUser({ username, password }) {

  const hashedPassword = await bcryptjs.hash(password, 10)

  try {

    await client.query(
      `
        INSERT INTO users(username, password) 
        VALUES($1, $2) 
        ON CONFLICT (username) DO NOTHING 
        RETURNING *;
      `, [username, hashedPassword]
    );

    const { rows: [createdUser] } = await client.query(
      `
      SELECT id, username 
      FROM users
      WHERE username=$1;
      `, [username]
    );

    return createdUser;
  } catch (error) {
    throw error;
  }
}

// * Passing all tests 
async function getUser({ username, password }) {
  try {
    const userToVerify = await getUserByUsername(username);

    const passwordValidation = await bcryptjs.compare(
      password,
      userToVerify.password
    );

    if (passwordValidation) {
      delete userToVerify.password
      return userToVerify;
    }
  } catch (error) {
    throw error;
  }
}

// * Passing all tests 
async function getUserById(userId) {
  try {
    const { rows: [user] } = await client.query(
      `
      SELECT id, username
      FROM users
      WHERE id=$1
      `, [userId]
    );

    return user;
  } catch (error) {
    throw error;
  }
}

// * Passing all tests 
async function getUserByUsername(username) {
  try {
    const { rows: [user] } = await client.query(
      `
      SELECT *
      FROM users
      WHERE username=$1
      `, [username]
    );

    return user;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
};
 
