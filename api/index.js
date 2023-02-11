const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');
const { JWT_SECRET } = process.env;

// * GET /api/health - Passing test
router.get('/health', async (req, res, next) => {
    res.send ({message: "Welcome to the site - Status: healthy"})
    next;
});
 
// This will run before all of the routers and get the user if token is received. It will store the user as req.user
router.use(async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');

    if (!auth) {
        next();
    } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      const { id } = jwt.verify(token, JWT_SECRET);

      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
    } else {
        next({
            name: 'AuthorizationHeaderError',
            message: `Authorization token must start with ${ prefix }`
        });
    }
});


// ROUTER: /api/users
const usersRouter = require('./users');
router.use('/users', usersRouter);

// ROUTER: /api/activities
const activitiesRouter = require('./activities');
router.use('/activities', activitiesRouter);

// ROUTER: /api/routines
const routinesRouter = require('./routines');
router.use('/routines', routinesRouter);

// ROUTER: /api/routine_activities
const routineActivitiesRouter = require('./routineActivities');
router.use('/routine_activities', routineActivitiesRouter);

// This will run if no matching route was found
router.use('*', (req, res, next) => {
  const err = new Error("Not found")
  err.status = 404
  res.status(404)
  next({
    name: "404 Error",
    error: "404",
    message: "Error 404 - Page not found"
  })
});

// This will run last and send any error messages passed in from next
// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  res.send({
    name: err.name,
    error: err.error,
    message: err.message
  });
});

module.exports = router;
