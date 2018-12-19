/** User class for message.ly */

const db = require('../db');

class Company {
  /** GET / -> get all users. */

  static async getAll() {
    const results = await db.query(`SELECT * FROM companies ORDER BY handle`);

    return results.rows;
  }
}

module.exports = Company;
