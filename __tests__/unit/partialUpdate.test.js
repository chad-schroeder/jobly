process.env.NODE_ENV = 'test';

const db = require('../../db');
const sqlForPartialUpdate = require('../../helpers/partialUpdate');

let company;

beforeEach(async () => {
  let result = await db.query(
    `
    INSERT INTO companies (handle, name)
    VALUES ($1, $2)
    RETURNING *
  `,
    ['google', 'Google']
  );
  company = result.rows[0];
});

describe('partialUpdate()', async () => {
  it('should generate a proper partial update query with just 1 field', async function() {
    const result = await sqlForPartialUpdate(
      'companies',
      { num_employees: 100, description: 'This is Google!' },
      'handle',
      company.handle
    );
    expect(result.values).toContain(100);
    expect(result.values).toContain('This is Google!');
    expect(result.values).toContain('google');
  });
});

afterEach(async () => {
  // delete any entries
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  // close db connection
  await db.end();
});
