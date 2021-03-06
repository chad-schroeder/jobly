const Router = require('express').Router;
const Company = require('../models/company');
const { ensureLoggedIn, ensureAdminUser } = require('../middleware/auth');
const { validate } = require('jsonschema');
const companySchema = require('../schemas/createCompany.json');
const updateCompanySchema = require('../schemas/updateCompany.json');

const router = new Router();

/** GET /companies
 * Get all companies, with optional search parameters.
 *  return {companies: [companyData, ...]}
 * */

router.get('/', ensureLoggedIn, async (req, res, next) => {
  try {
    let { search, min_employees, max_employees } = req.query;

    if (Number(min_employees) > Number(max_employees)) {
      let err = new Error();
      err.message = 'min_employees cannot be greater than max_employees';
      err.status = 400;
      return next(err);
    }

    return res.json({
      companies: await Company.getAll(search, min_employees, max_employees)
    });
  } catch (err) {
    return next(err);
  }
});

/** POST /companies
 * Add a company:
 *  return {company: companyData}
 */

router.post('/', ensureAdminUser, async (req, res, next) => {
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
    let checkExisting = await Company.getCompany(handle, true);

    if (checkExisting) {
      let error = new Error();
      error.status = 400;
      error.message =
        'The company handle already exists, choose a different one!';
      return next(error);
    }

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

/** GET /companies/[handle]
 * Get a company:
 *   return {company: companyData}
 */

router.get('/:handle', ensureLoggedIn, async (req, res, next) => {
  try {
    const company = await Company.getCompany(req.params.handle);

    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /companies/[handle]
 * Update a company:
 *   return {company: companyData}
 */

router.patch('/:handle', ensureAdminUser, async (req, res, next) => {
  try {
    // verify correct schema
    const validationResult = validate(req.body, updateCompanySchema);

    if (!validationResult.valid) {
      // pass validation errors to error handler
      //  (the "stack" key is generally the most useful)
      let message = validationResult.errors.map(error => error.stack);
      let error = new Error(message);
      error.status = 400;
      error.message = message;
      return next(error);
    }

    const { token, ...payload } = req.body;
    const company = await Company.updateCompany(req.params.handle, payload);

    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /companies/[handle]
 * Delete a company
 *  return {message: "Company deleted"}
 */

router.delete('/:handle', ensureAdminUser, async (req, res, next) => {
  try {
    await Company.deleteCompany(req.params.handle);

    return res.json({ message: 'Company deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
