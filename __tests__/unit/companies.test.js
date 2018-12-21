process.env.NODE_ENV = 'test';
const db = require('../../db');
const app = require('../../app');
const Company = require('../../models/company');
const request = require('supertest');

let google;
let apple;

beforeEach(async () => {
  // delete any entries
  await db.query(`DELETE FROM companies`);

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

//Test the Company.getAll model
// describe('Companies.getAll', async () => {
//   test('Get a list of all companies', async () => {
//     let result = await Company.getAll();
//     expect(result).toHaveLength(2);
//   });

//   test('Get a list of companies that have a name similar to "Google"', async () => {
//     let result = await Company.getAll('goo');
//     expect(result[0].name).toEqual('Google');
//   });

//   test('Get a list of companies where number of employees is at least 4000', async () => {
//     let result = await Company.getAll('', 4000);
//     expect(result[0].name).toEqual('Google');
//   });

//   test('Get a list of companies where number of employees is not more than 2000', async () => {
//     let result = await Company.getAll('', '', 2000);
//     expect(result[0].name).toEqual('Apple');
//   });

//   test('Get an error message if minimum number of employees exceeds maximum number', async () => {
//     let result = await Company.getAll('', 2001, 2000);
//     expect(result).toEqual([]);
//   });

//   test('Returns a list of companies that match search name, minimum employees and maxiumum employees', async () => {
//     let result = await Company.getAll('goo', 2000, 6000);
//     expect(result[0].name).toEqual('Google');
//   });
// });

describe('Get /companies', async () => {
  test('Get all companies', async () => {
    const response = await request(app).get('/companies');
    expect(response.status).toBe(200);
    expect(response.body.companies[0].handle).toEqual('google');
    expect(response.body.companies[1].handle).toEqual('apple');
  });
  test('Get companies with a name like "goog"', async () => {
    const response = await request(app)
      .get('/companies')
      .query({ search: 'goog' });
    expect(response.status).toBe(200);
    expect(response.body.companies[0].handle).toEqual('google');
  });
  test('Get companies with a name like "abcd', async () => {
    const response = await request(app)
      .get('/companies')
      .query({ search: 'abcd' });
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual(
      'Your filters did not match any company.'
    );
  });
  test('Get companies with a name like "goog" and num_employees >= 5', async () => {
    const response = await request(app)
      .get('/companies')
      .query({ search: 'goog', min_employees: '4000' });
    expect(response.status).toBe(200);
    expect(response.body.companies[0].handle).toEqual('google');
  });
  test('Get companies with a name like "goog" and num_employees >= 10000', async () => {
    const response = await request(app)
      .get('/companies')
      .query({ search: 'goog', min_employees: 10000 });
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual(
      'Your filters did not match any company.'
    );
  });
  test('Get companies with a name like "goog" and num_employees >= 4000 and num_employees <= 5000 ', async () => {
    const response = await request(app)
      .get('/companies')
      .query({ search: 'goog', min_employees: 4000, max_employees: 5000 });
    expect(response.status).toBe(200);
    expect(response.body.companies[0].handle).toEqual('google');
  });
  test('Get companies with a name like "goog" and num_employees >= 10000 and num_employees <= 5000 ', async () => {
    const response = await request(app)
      .get('/companies')
      .query({ search: 'goog', min_employees: 10000, max_employees: 5000 });
    expect(response.status).toBe(400);
    expect(response.body.error.message).toEqual(
      'min_employees cannot be greater than max_employees'
    );
  });
});

describe('POST /companies', async () => {
  test('Create a new company with correct data', async () => {
    const response = await request(app)
      .post('/companies')
      .send({
        handle: 'uber',
        name: 'Uber',
        num_employees: 8000,
        description: 'This is Uber',
        logo_url: ''
      });
    expect(response.status).toBe(200);
    expect(response.body.company.handle).toEqual('uber');
  });

  test('Create a new company with incorrect data', async () => {
    const response = await request(app)
      .post('/companies')
      .send({
        handle: '',
        name: 'Uber',
        num_employees: 8000,
        description: 'This is Uber',
        logo_url: ''
      });
    expect(response.error.status).toBe(400);
    expect(response.body.message).toEqual([
      'instance.handle does not meet minimum length of 1'
    ]);
  });
});

describe('GET /companies/:handle', async () => {
  test('Get a company by correct handle', async () => {
    const response = await request(app).get('/companies/google');
    expect(response.status).toBe(200);
    expect(response.body.company.handle).toEqual('google');
  });

  test('Get a company by incorrect handle', async () => {
    const response = await request(app).get('/companies/abcdef');
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual('No such company: abcdef');
  });
});

describe('PATCH /companies/:handle', async () => {
  test('Update a company', async () => {
    const response = await request(app)
      .patch('/companies/google')
      .send({
        num_employees: 1000
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.company.num_employees).toEqual(1000);
  });
});

describe('DELETE /companies/:handle', async () => {
  test('Delete a company', async () => {
    const response = await request(app).delete('/companies/apple');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Company deleted' });
  });
});

afterAll(async () => {
  // close db connection
  await db.end();
});
