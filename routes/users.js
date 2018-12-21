const Router = require('express').Router;
const User = require('../models/user');
const { ensureCorrectUser } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../config');
const { validate } = require('jsonschema');
const createUserSchema = require('../schemas/createUser.json');

const router = new Router();

/** GET /users
 * Get all users, with optional search parameters.
 *  return {users: [UserData, ...]}
 * */

router.get('/', async (req, res, next) => {
  try {
    return res.json({ users: await User.getAll() });
  } catch (err) {
    return next(err);
  }
});

/** POST /users
 * Add a user:
 *  return {user: userData}
 */

router.post('/', async (req, res, next) => {
  try {
    const {
      username,
      password,
      first_name,
      last_name,
      email,
      photo_url,
      is_admin
    } = req.body;

    // verify correct schema
    let validationResult = validate(req.body, createUserSchema);

    if (!validationResult.valid) {
      // pass validation errors to error handler
      //  (the "stack" key is generally the most useful)
      let message = validationResult.errors.map(error => error.stack);
      let error = new Error(message);
      error.status = 400;
      error.message = message;
      return next(error);
    }

    let checkExisting = await User.getUser(username, true);

    if (checkExisting) {
      let error = new Error();
      error.status = 400;
      error.message =
        'The username or email already exists, choose a different one!';
      return next(error);
    }

    const result = await User.addUser(
      username,
      password,
      first_name,
      last_name,
      email,
      photo_url,
      is_admin
    );

    const token = jwt.sign({ username, is_admin: result.is_admin }, SECRET, {});
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

/** GET /User/[id]
 * Get a User:
 *   return {User: UserData, userData}
 */

router.get('/:username', async (req, res, next) => {
  try {
    const user = await User.getUser(req.params.username);

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /users/[id]
 * Update a User:
 *   return {user: userData}
 */

router.patch('/:username', ensureCorrectUser, async (req, res, next) => {
  try {
    const { token, ...payload } = req.body;
    const user = await User.updateUser(req.params.username, payload);

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /users/[id]
 * Delete a user
 *  return {message: "user deleted"}
 */

router.delete('/:username', ensureCorrectUser, async (req, res, next) => {
  try {
    await User.deleteUser(req.params.username);
    return res.json({ message: 'user deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
