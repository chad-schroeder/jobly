/** User class for message.ly */

const db = require('../db');

class Company {
  /** GET /companies
   * Get all companies, with optional search parameters.
   *  return {companies: [companyData, ...]}
   * */

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

  /** POST /companies
   * Add a company:
   *  return {company: companyData}
   */
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

  /** GET /companies/[handle]
   * Get a company:
   *   return {company: companyData}
   */
  static async getCompany(id) {}

  /** PATCH /companies/[handle]
   * Update a company:
   *   return {company: companyData}
   */

  /** DELETE /companies/[handle]
   * Delete a company
   *  return {message: "Company deleted"}
   */
}

module.exports = Company;
