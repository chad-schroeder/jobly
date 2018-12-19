/** Express app for jobly. */

const express = require('express');
const { validate } = require('jsonschema');

const app = express();

app.use(express.json());

/** routes */

const companyRoutes = require('./routes/companies');

app.use('/companies', companyRoutes);

// add logging system

const morgan = require('morgan');
app.use(morgan('tiny'));

/** 404 handler */

app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function(err, req, res, next) {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});

module.exports = app;
