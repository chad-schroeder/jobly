const Router = require('express').Router;
const User = require('../models/user');
const { validate } = require('jsonschema');
const createUserSchema = require('../schemas/createUser.json');
const updateUserSchema = require('../schemas/updateUser.json');

const router = new Router();

/** GET /users
 * Get all users, with optional search parameters.
 *  return {users: [UserData, ...]}
 * */

router.get('/', async (req, res, next) => {
  try {
    return res.json({ user: await User.getAll() });
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

    const id = req.query.id;
    const user = await User.getUser(id);

    if (!user) {
      // error
    }

    const result = await User.addUser(id);

    return res.json({ result });
  } catch (err) {
    return next(err);
  }
});

/** GET /User/[id]
 * Get a User:
 *   return {User: UserData, companyData}
 */

router.get('/:id', async (req, res, next) => {
  try {
    let id = req.params.id;

    let User = await User.getUser(id);

    return res.json({ User });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /users/[id]
 * Update a User:
 *   return {user: userData}
 */

router.patch('/:id', async (req, res, next) => {
  try {
    // verify correct schema
    let validationResult = validate(req.body, updateUserSchema);

    if (!validationResult.valid) {
      // pass validation errors to error handler
      //  (the "stack" key is generally the most useful)
      let message = validationResult.errors.map(error => error.stack);
      let error = new Error(message);
      error.status = 400;
      error.message = message;
      return next(error);
    }

    const User = await User.updateUser(req.params.id, req.body);

    return res.json({ User });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /users/[id]
 * Delete a user
 *  return {message: "user deleted"}
 */

router.delete('/:id', async (req, res, next) => {
  try {
    await User.deleteuser(req.params.id);
    return res.json({ message: 'user deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
