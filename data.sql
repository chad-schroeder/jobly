DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies
(
    handle text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    num_employees int,
    description text,
    logo_url text
);

INSERT INTO companies
    (handle, name, num_employees, description)
VALUES
    ('apple', 'Apple', 1, 'This is Apple');

INSERT INTO companies
    (handle, name, num_employees, description)
VALUES
    ('google', 'Google', 5, 'This is Google');

INSERT INTO companies
    (handle, name, num_employees, description)
VALUES
    ('ibm', 'IBM', 3, 'This is IBM');

CREATE TABLE jobs
(
    id SERIAL PRIMARY KEY,
    title text NOT NULL,
    salary float NOT NULL,
    equity float NOT NULL CHECK
(equity <= 1),
    company_handle text,
    date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY
(company_handle) references companies
(handle) ON
DELETE CASCADE
);

INSERT INTO jobs
    (title, salary, equity, company_handle)
VALUES
    ('first job', 100, 0.5, 'apple');
INSERT INTO jobs
    (title, salary, equity, company_handle)
VALUES
    ('second job', 200, 1, 'apple');
INSERT INTO jobs
    (title, salary, equity, company_handle)
VALUES
    ('third job', 1000, 0.8, 'apple');
