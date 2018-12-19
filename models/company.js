/** User class for message.ly */

const db = require('../db');

class Company {
  /** GET / -> get all users. */

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
      let searchQuery = `num_employees > $${counter}`;
      counter++;
      builtQueryArr.push(searchQuery);
      queryArr.push(minEmployees);
    }

    if (maxEmployees) {
      let searchQuery = `num_employees < $${counter}`;
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
}

module.exports = Company;
