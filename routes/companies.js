const Router = require('express').Router;
const Company = require('../models/company');
const { validate } = require('jsonschema');
const companySchema = require('../schemas/createCompany.json');
const updateCompanySchema = require('../schemas/updateCompany.json');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

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

router.post('/', async (req, res, next) => {
  // verify correct schema
  let validationResult = validate(req.body, companySchema);

  if (!validationResult.valid) {
    // pass validation errors to error handler
    //  (the "stack" key is generally the most useful)
    let message = validationResult.errors.map(error => error.stack);
    let error = new Error(message);
    error.status = 400;
    error.message = message;
    return next(error);
  }

  const { handle, name, num_employees, description, logo_url } = req.body;
  try {
    let company = await Company.addCompany(
      handle,
      name,
      num_employees,
      description,
      logo_url
    );

    return res.json({
      company
    });
  } catch (err) {
    return next(err);
  }
});

router.get('/:handle', async (req, res, next) => {
  try {
    let handle = req.params.handle;

    let company = await Company.getCompany(handle);

    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

router.patch('/:handle', async (req, res, next) => {
  try {
    // verify correct schema
    let validationResult = validate(req.body, updateCompanySchema);

    if (!validationResult.valid) {
      // pass validation errors to error handler
      //  (the "stack" key is generally the most useful)
      let message = validationResult.errors.map(error => error.stack);
      let error = new Error(message);
      error.status = 400;
      error.message = message;
      return next(error);
    }

    let handle = req.params.handle;

    //table, items, key, id
    let updatedCompany = await sqlForPartialUpdate(
      'companies',
      req.body,
      'handle',
      handle
    );

    let company = await Company.getCompany(handle);

    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

router.delete('/:handle', async (req, res, next) => {
  try {
    let handle = req.params.handle;

    let result = await Company.deleteCompany(handle);

    return res.json({ message: 'Company deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
