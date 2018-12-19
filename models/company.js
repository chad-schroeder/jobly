/** User class for message.ly */

const db = require('../db');

class Company {
  /** GET / -> get all users. */

  static async getAll(search = '', minEmployees, maxEmployees) {
    let query = `SELECT handle, name FROM companies`;
    let searchQuery;

    if (search) {
      search = `%${search}%`;
      searchQuery = `WHERE name ILIKE $1`;

      query += searchQuery;
    }

    const results = await db.query(query, [search]);
    return results.rows;
  }

  static async searchCompany(searchString) {
    let search = `%${searchString}%`;
    const results = await db.query(
      `SELECT handle, name FROM companies WHERE name ILIKE = $1 ORDER BY handle`,
      [search]
    );

    return results.rows;
  }
}

module.exports = Company;
