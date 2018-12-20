const db = require('../db');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

class Job {
  static async getAll(search, minSalary, minEquity) {
    let query = `SELECT title, company_handle FROM jobs `;
    let queryArr = [];
    let builtQueryArr = [];
    let counter = 1;

    if (search || minSalary || minEquity) {
      query += 'WHERE ';
    }

    if (search) {
      search = `%${search}%`;
      let searchQuery = `title ILIKE $${counter}`;
      counter++;

      builtQueryArr.push(searchQuery);
      queryArr.push(search);
    }

    if (minSalary) {
      let searchQuery = `salary >= $${counter}`;
      counter++;
      builtQueryArr.push(searchQuery);
      queryArr.push(minSalary);
    }

    if (minEquity) {
      let searchQuery = `equity >= $${counter}`;
      counter++;
      builtQueryArr.push(searchQuery);
      queryArr.push(minEquity);
    }

    if (builtQueryArr.length) {
      query += builtQueryArr.join(' AND ');
    }

    query += ` ORDER BY date_posted DESC`;

    const results = await db.query(query, queryArr);
    return results.rows;
  }

  static async addJob(title, salary, equity, company_handle) {
    let result = await db.query(
      `
      INSERT INTO jobs(title, salary, equity, company_handle)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [title, salary, equity, company_handle]
    );
    return result.rows[0];
  }

  static async getJob(id) {
    let result = await db.query(
      `
      SELECT
        *
      FROM
        jobs j
      JOIN
        companies c
      ON
        c.handle = j.company_handle
      WHERE
        id = $1
    `,
      [id]
    );

    let job = result.rows[0];

    if (!result.rows[0]) {
      let error = new Error(`No such job: ${id}`);
      error.status = 404;
      throw error;
    }

    return {
      id: job.id,
      title: job.title,
      salary: job.salary,
      equity: job.equity,
      date_posted: job.date_posted,
      company: {
        handle: job.company_handle,
        name: job.name,
        num_employees: job.num_employees,
        description: job.description,
        logo_url: job.logo_url
      }
    };
  }

  static async updateJob(id, body) {
    let queryObj = await sqlForPartialUpdate('jobs', body, 'id', id);
    let result = await db.query(queryObj.query, queryObj.values);

    if (!result.rows[0]) {
      let error = new Error(`No such job: ${id}`);
      error.status = 404;
      throw error;
    }

    return result.rows[0];
  }

  static async deleteJob(id) {
    let result = await db.query(`DELETE FROM jobs WHERE id = $1 RETURNING *`, [
      id
    ]);

    if (!result.rows[0]) {
      let error = new Error(`No such job to delete: ${id}`);
      error.status = 404;
      throw error;
    }

    return result.rows[0];
  }
}

module.exports = Job;
