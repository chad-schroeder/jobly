/** Middleware for handling req authorization for routes. */

const jwt = require('jsonwebtoken');
const { SECRET } = require('../config.js');

/** Middleware: Requires user is logged in. */

function ensureLoggedIn(req, res, next) {
  try {
    const token = req.body.token || req.query.token;
    const { username, is_admin } = jwt.verify(token, SECRET);

    // put username and is_admin on request as a convenience for routes
    req.username = username;
    req.is_admin = is_admin;
    return next();
  } catch (err) {
    return next({ status: 401, message: 'Unauthorized' });
  }
}

/** Middleware: Requires :username is logged in. */

function ensureCorrectUser(req, res, next) {
  try {
    const token = req.body.token || req.query.token;
    const { username, is_admin } = jwt.verify(token, SECRET);

    if (username === req.params.username) {
      // put username on request as a convenience for routes
      req.username = username;
      req.is_admin = is_admin;
      return next();
    } else {
      throw new Error();
    }
  } catch (err) {
    return next({ status: 401, message: 'Unauthorized' });
  }
}

/** Middleware: Require user to be an admin. */

function ensureAdminUser(req, res, next) {
  try {
    const token = req.body.token || req.query.token;
    const { username, is_admin } = jwt.verify(token, SECRET);

    if (is_admin) {
      // put username on request as a convenience for routes
      req.username = username;
      req.is_admin = is_admin;
      return next();
    } else {
      throw new Error();
    }
  } catch (err) {
    return next({ status: 401, message: 'Unauthorized' });
  }
}

module.exports = {
  ensureLoggedIn,
  ensureCorrectUser,
  ensureAdminUser
};
