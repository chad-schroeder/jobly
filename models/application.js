const db = require('../db');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

class Application {
  static async addApplication(username, id, state) {
    let result = await db.query(
      `
      INSERT INTO
        applications
        (username, job_id, state)
      VALUES
        ($1, $2, $3)
      RETURNING
        state;
    `,
      [username, id, state]
    );

    return result.rows[0].state;
  }
}

module.exports = Application;
