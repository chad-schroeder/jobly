const db = require('../db');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

class Company {
  /** Get all companies
   *    returns { companies: companyData }
   */

  static async getAll(search, minEmployees, maxEmployees) {
    let query = `SELECT handle, name FROM companies `;
    let queryArr = [];
    let builtQueryArr = [];
    let counter = 1;

    if (search || minEmployees || maxEmployees) {
      query += 'WHERE ';
    }

    if (search) {
      search = `%${search}%`;
      let searchQuery = `name ILIKE $${counter}`;
      counter++;

      builtQueryArr.push(searchQuery);
      queryArr.push(search);
    }

    if (minEmployees) {
      let searchQuery = `num_employees >= $${counter}`;
      counter++;
      builtQueryArr.push(searchQuery);
      queryArr.push(minEmployees);
    }

    if (maxEmployees) {
      let searchQuery = `num_employees <= $${counter}`;
      counter++;
      builtQueryArr.push(searchQuery);
      queryArr.push(maxEmployees);
    }

    if (builtQueryArr.length) {
      query += builtQueryArr.join(' AND ');
    }

    const results = await db.query(query, queryArr);
    return results.rows;
  }

  static async addCompany(
    handle,
    name,
    num_employees = 0,
    description = '',
    logo_url = ''
  ) {
    let result = await db.query(
      `
      INSERT INTO companies(handle, name, num_employees, description, logo_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
      [handle, name, num_employees, description, logo_url]
    );
    return result.rows[0];
  }

  static async getCompany(handle) {
    let result = await db.query(
      `
      SELECT
        *
      FROM
        companies
      WHERE
        handle = $1
    `,
      [handle]
    );

    return result.rows[0];
  }

  static async updateCompany(handle, body) {
    let queryObj = await sqlForPartialUpdate(
      'companies',
      body,
      'handle',
      handle
    );

    let result = await db.query(queryObj.query, queryObj.values);
    return result.rows[0];
  }

  static async deleteCompany(handle) {
    let result = await db.query(
      `
      DELETE FROM
        companies
      WHERE
        handle = $1
      `,
      [handle]
    );

    return result.rows[0];
  }
}

module.exports = Company;
