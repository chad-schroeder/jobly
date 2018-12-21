const db = require('../db');
const sqlForPartialUpdate = require('../helpers/partialUpdate');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_ROUNDS } = require('../config');

class User {
  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      'SELECT password, is_admin FROM users WHERE username = $1',
      [username]
    );
    const user = result.rows[0];
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
  }

  static async addUser(
    username,
    password,
    first_name,
    last_name,
    email,
    photo_url,
    is_admin
  ) {
    password = await bcrypt.hash(password, BCRYPT_WORK_ROUNDS);

    let result = await db.query(
      `
      INSERT INTO 
        users 
        (username, password, first_name, last_name, email, photo_url, is_admin)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        *
    `,
      [username, password, first_name, last_name, email, photo_url, is_admin]
    );
    return result.rows[0];
  }

  static async getAll() {
    let results = await db.query(
      `
      SELECT
        *
      FROM
        users
    `
    );

    let users = results.rows[0];

    if (!users) {
      let error = new Error(`No users present`);
      error.status = 404;
      throw error;
    }

    return results.rows;
  }

  static async getUser(username, register = false) {
    let results = await db.query(
      `
      SELECT
        u.username,
        u.last_name,
        u.first_name,
        u.email,
        u.photo_url,
        a.state,
        j.title,
        j.salary,
        j.equity,
        j.company_handle
      FROM
        users u
      LEFT JOIN
        applications a
      ON
        u.username = a.username
      LEFT JOIN
        jobs j
      ON
        a.job_id = j.id
      WHERE
        u.username = $1
    `,
      [username]
    );

    let u = results.rows[0];

    let result;
    if (u) {
      result = {
        user: u.username,
        last_name: u.last_name,
        first_name: u.first_name,
        email: u.email,
        photo_url: u.photo_url
      };

      let jobs = results.rows.map(j => {
        return {
          state: j.state,
          title: j.title,
          salary: j.salary,
          equity: j.equity,
          company_handle: j.company_handle
        };
      });

      if (jobs[0].state === null) {
        result.jobs = [];
      } else {
        result.jobs = jobs;
      }
    }

    if (!u && !register) {
      let error = new Error(`No such user: ${username}`);
      error.status = 404;
      throw error;
    }

    return result;
  }

  static async updateUser(username, body) {
    let queryObj = await sqlForPartialUpdate(
      'users',
      body,
      'username',
      username
    );

    let result = await db.query(queryObj.query, queryObj.values);

    let user = result.rows[0];

    if (!user) {
      let error = new Error(`No such user: ${username}`);
      error.status = 404;
      throw error;
    }

    return result.rows[0];
  }

  static async deleteUser(username) {
    let result = await db.query(
      `
      DELETE FROM
        users
      WHERE
        username = $1
      RETURNING
        *
      `,
      [username]
    );

    let user = result.rows[0];

    if (!user) {
      let error = new Error(`No such user: ${username}`);
      error.status = 404;
      throw error;
    }

    return result.rows[0];
  }
}

module.exports = User;
