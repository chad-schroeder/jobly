const Router = require('express').Router;
const Company = require('../models/company');

const router = new Router();

router.get('/', async (req, res, next) => {
  try {
    let { search, min_employees, max_employees } = req.query;

    if (Number(min_employees) > Number(max_employees)) {
      let err = new Error();
      err.message = 'min_employees cannot be greater than max_employees';
      err.status = 400;
      return next();
    }

    return res.json({
      companies: await Company.getAll(search, min_employees, max_employees)
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
