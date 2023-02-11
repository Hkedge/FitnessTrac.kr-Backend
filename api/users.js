/* eslint-disable no-useless-catch */
const express = require("express");
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');
// const { restart } = require("nodemon"); //? This was added as part of the starter code not sure what it is for
const {  createUser, getUser, getUserByUsername, getAllRoutinesByUser, getPublicRoutinesByUser } = require('../db')
const { UserDoesNotExistError, PasswordTooShortError, UserTakenError} = require('../errors')

const { requireUser } = require('./utils.js');


// * POST /api/users/register - Passing all tests
usersRouter.post("/register", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        error: "User name taken",
        message: UserTakenError(username),
        name: "User name taken",
      });
    }

    if (password.length < 8) {
      next({
        error: "Password is too short",
        message: PasswordTooShortError(),
        name: "Password length Error",
      });
    }

    const user = await createUser({
      username,
      password,
    });

    const token = jwt.sign(
      {
        id: user.id,
        username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1w",
      }
    );

    res.send({
      message: "thank you for signing up",
      token: token,
      user: {
        id: user.id,
        username: username,
      },
    });

  } catch (error) {
    next(error);
  }

});

// * POST /api/users/login - Passing all tests
usersRouter.post("/login", async (req, res, next) => {
  const { username } = req.body;

  try {
    const userNameExists = getUserByUsername(username);

    if (!userNameExists) {
      next({
        error: "User not found",
        message: UserDoesNotExistError(username),
        name: "User not found",
      });
    }

    const user = await getUser(req.body);

    if (user) {
      const token = jwt.sign(user, process.env.JWT_SECRET);

      res.send({
        message: "you're logged in!",
        token: token,
        user: user,
      });
    } else {
      next({
        error: "CredentialsError",
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }

  } catch (error) {
    console.log(error);
    next(error);
  }
});

// * GET /api/users/me - Passing all tests
usersRouter.get("/me", requireUser, async (req, res) => {

  res.send(req.user);

});

// * GET /api/users/:username/routines - Passing all tests
usersRouter.get("/:username/routines", async (req, res, next) => {

  try {

    if (req.params.username === req.user.username) {

      const signedInUsersRoutines = await getAllRoutinesByUser(req.user);
      res.send(signedInUsersRoutines);
    } else {
      const otherUserPublicRoutines = await getPublicRoutinesByUser(req.params);
      res.send(otherUserPublicRoutines);
    }
    
  } catch (error) {
    next(error);
  }

});

module.exports = usersRouter;