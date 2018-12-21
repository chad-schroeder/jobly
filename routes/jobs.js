const Router = require('express').Router;
const Job = require('../models/job');
const { ensureLoggedIn, ensureAdminUser } = require('../middleware/auth');
const { validate } = require('jsonschema');
const createJobSchema = require('../schemas/createJob.json');
const updateJobSchema = require('../schemas/updateJob.json');

const router = new Router();

/** GET /jobs
 * Get all jobs, with optional search parameters.
 *  return {jobs: [jobData, ...]}
 * */

router.get('/', ensureLoggedIn, async (req, res, next) => {
  try {
    const { search, min_salary, min_equity } = req.query;

    return res.json({
      jobs: await Job.getAll(search, min_salary, min_equity)
    });
  } catch (err) {
    return next(err);
  }
});

/** POST /jobs
 * Add a job:
 *  return {job: jobData}
 */

router.post('/', ensureAdminUser, async (req, res, next) => {
  try {
    // verify correct schema
    const validationResult = validate(req.body, createJobSchema);

    if (!validationResult.valid) {
      // pass validation errors to error handler
      //  (the "stack" key is generally the most useful)
      let message = validationResult.errors.map(error => error.stack);
      let error = new Error(message);
      error.status = 400;
      error.message = message;
      return next(error);
    }

    const { title, salary, equity, company_handle } = req.body;
    const job = await Job.addJob(title, salary, equity, company_handle);

    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET /job/[id]
 * Get a job:
 *   return {job: jobData, companyData}
 */

router.get('/:id', ensureLoggedIn, async (req, res, next) => {
  try {
    const job = await Job.getJob(req.params.id);

    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /jobs/[id]
 * Update a job:
 *   return {job: jobData}
 */

router.patch('/:id', ensureAdminUser, async (req, res, next) => {
  try {
    // verify correct schema
    const validationResult = validate(req.body, updateJobSchema);

    if (!validationResult.valid) {
      // pass validation errors to error handler
      let message = validationResult.errors.map(error => error.stack);
      let error = new Error(message);
      error.status = 400;
      error.message = message;
      return next(error);
    }

    const { token, ...payload } = req.body;
    const job = await Job.updateJob(req.params.id, payload);

    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /jobs/[id]
 * Delete a job
 *  return {message: "Job deleted"}
 */

router.delete('/:id', ensureAdminUser, async (req, res, next) => {
  try {
    await Job.deleteJob(req.params.id);
    return res.json({ message: 'Job deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
