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

router.post('/', async (req, res, next) => {
  try {
    let { title, salary, equity, company_handle } = req.body;

    let job = await Job.addJob(title, salary, equity, company_handle);

    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    let id = req.params.id;

    let job = await Job.getJob(id);

    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const job = await Job.updateJob(req.params.id, req.body);

    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Job.deleteJob(req.params.id);
    return res.json({ message: 'Job deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
