const { UnauthorizedError } = require("../errors");

// * This can be called if a user is required to complete a request - if the user is not found from the first piece of middleware it will
  // * automatically move to next and send the Unauthorized error
function requireUser(req, res, next) {
  if (!req.user) {

    res.status(401);

    next({
      error: UnauthorizedError(),
      message: UnauthorizedError(),
      name: "User token not received",
    });

  }
  
  next();
}
  
module.exports = {
  requireUser
}