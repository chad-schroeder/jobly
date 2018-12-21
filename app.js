/** Express app for jobly. */

const express = require('express');
const jwt = require('jsonwebtoken');
// const { SECRET_KEY } = require('../config');

const app = express();
app.use(express.json());

/** routes */

const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/companies');
const jobRoutes = require('./routes/jobs');
const userRoutes = require('./routes/users');

app.use('/companies', companyRoutes);
app.use('/jobs', jobRoutes);
app.use('/users', userRoutes);
app.use('/', authRoutes);

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
