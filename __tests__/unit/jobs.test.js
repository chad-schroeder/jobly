process.env.NODE_ENV = 'test';
const db = require('../../db');
const app = require('../../app');
const Job = require('../../models/job');
const request = require('supertest');

let job;

beforeEach(async () => {
  // delete any entries
  await db.query(`DELETE FROM jobs`);
  await db.query(`DELETE FROM companies`);

  await db.query(
    `
    INSERT INTO companies(handle, name, num_employees, description, logo_url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,
    ['google', 'Google', 4000, 'This is Google!', '']
  );
  job = await db.query(
    `INSERT INTO jobs (title, salary, equity, company_handle)
    VALUES ('test job', 100, 0.5, 'google')
    RETURNING *`
  );
});

describe('Tests for GET /jobs', async () => {
  test('Get a list of all jobs ordered by most recent job date', async () => {
    const response = await Job.getAll();
    expect(response).toHaveLength(1);
    expect(response[0].title).toEqual('test job');
  });

  test('Get jobs with a title like "test"', async () => {
    const response = await request(app)
      .get('/jobs')
      .query({ search: 'test' });
    expect(response.status).toBe(200);
    expect(response.body.jobs).toHaveLength(1);
    expect(response.body.jobs[0].title).toEqual('test job');
  });

  test('Should not find a job with a title like "abcd', async () => {
    const response = await request(app)
      .get('/jobs')
      .query({ search: 'abcd' });
    expect(response.status).toBe(200);
    expect(response.body.jobs).toEqual([]);
  });

  test('Get jobs with a title like "test" and min_salary >= 100', async () => {
    const response = await request(app)
      .get('/jobs')
      .query({ search: 'test', min_salary: 100 });
    expect(response.status).toBe(200);
    expect(response.body.jobs[0].title).toEqual('test job');
  });

  test('Get jobs with a title like "test" and min_equity >= 0.5', async () => {
    const response = await request(app)
      .get('/jobs')
      .query({ search: 'test', min_equity: 0.5 });
    expect(response.status).toBe(200);
    expect(response.body.jobs[0].title).toEqual('test job');
  });

  test('Get jobs with a title like "test" and min_salary >= 100 and min_equity >= 0.5', async () => {
    const response = await request(app)
      .get('/jobs')
      .query({ search: 'test', min_salary: 99, min_equity: 0.5 });
    expect(response.status).toBe(200);
    expect(response.body.jobs[0].title).toEqual('test job');
  });
});

describe('Tests for GET /jobs/:id', async () => {
  test('Get a job with valid id', async () => {
    const id = job.rows[0].id;
    const response = await request(app).get(`/jobs/${id}`);
    expect(response.status).toBe(200);
    expect(response.body.job.title).toEqual('test job');
  });

  test('Get a job with an invalid id', async () => {
    const response = await request(app).get(`/jobs/asdf`);
    expect(response.status).toBe(500);
    expect(response.body.message).toEqual(
      'invalid input syntax for integer: "asdf"'
    );
  });

  describe('PATCH /jobs/:id', async () => {
    test('Update a job', async () => {
      const id = job.rows[0].id;
      const response = await request(app)
        .patch(`/jobs/${id}`)
        .send({
          title: 'updated job'
        });
      expect(response.status).toBe(200);
      expect(response.body.job.title).toEqual('updated job');
    });
  });
});

describe('DELETE /jobs/:id', async () => {
  test('Delete a job', async () => {
    const id = job.rows[0].id;
    const response = await request(app).delete(`/jobs/${id}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Job deleted' });
  });
});

afterAll(async () => {
  // close db connection
  await db.end();
});
