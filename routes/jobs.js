const Router = require('express').Router;
const Job = require('../models/job');
const { validate } = require('jsonschema');
// const companySchema = require('../schemas/createCompany.json');
// const updateCompanySchema = require('../schemas/updateCompany.json');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

const router = new Router();

/** GET /jobs
 * Get all jobs, with optional search parameters.
 *  return {jobs: [jobData, ...]}
 * */

router.get('/', async (req, res, next) => {
  try {
    let { search, min_salary, min_equity } = req.query;

    return res.json({
      jobs: await Job.getAll(search, min_salary, min_equity)
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
