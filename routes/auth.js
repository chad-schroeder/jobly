const jwt = require('jsonwebtoken');
const { SECRET } = require('../config');
const Router = require('express').Router;
const User = require('../models/user');

const router = new Router();

/** Login */

router.post('/login', async function(req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await User.authenticate(username, password);

    if (user) {
      let token = jwt.sign({ username, is_admin: user.is_admin }, SECRET, {});
      return res.json({ token });
    } else {
      throw new Error('Invalid username/password');
    }
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
