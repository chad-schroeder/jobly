const db = require('../../db');
const Company = require('../../models/company');

let google;
let apple;

beforeEach(async () => {
  google = await db.query(
    `
    INSERT INTO companies(handle, name, num_employees, description, logo_url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,
    ['google', 'Google', 4000, 'This is Google!', '']
  );
  apple = await db.query(
    `
    INSERT INTO companies(handle, name, num_employees, description, logo_url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,
    ['apple', 'Apple', 2000, 'This is Apple!', '']
  );
});

describe('Get / companies', async () => {
  test('Get a list of all companies', async () => {
    let result = await Company.getAll();
    expect(result).toHaveLength(2);
  });

  test('Get a list of companies that have a name similar to "Google"', async () => {
    let result = await Company.getAll('goo');
    expect(result[0].name).toEqual('Google');
  });

  test('Get a list of companies where number of employees is at least 4000', async () => {
    let result = await Company.getAll('', 4000);
    expect(result[0].name).toEqual('Google');
  });

  test('Get a list of companies where number of employees is not more than 2000', async () => {
    let result = await Company.getAll('', '', 2000);
    expect(result[0].name).toEqual('Apple');
  });

  test('Get an error message if minimum number of employees exceeds maximum number', async () => {
    let result = await Company.getAll('', 2001, 2000);
    expect(result).toEqual([]);
  });

  test('Returns a list of companies that match search name, minimum employees and maxiumum employees', async () => {
    let result = await Company.getAll('goo', 2000, 6000);
    expect(result[0].name).toEqual('Google');
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
