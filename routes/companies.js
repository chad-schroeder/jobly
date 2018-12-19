const Router = require('express').Router;
const Company = require('../models/company');

const router = new Router();

router.get('/', async (req, res, next) => {
  try {
    return res.json({ companies: await Company.getAll() });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
