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
}

module.exports = Job;
