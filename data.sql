DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
  handle text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  num_employees int,
  description text,
  logo_url text
);

INSERT INTO companies (handle, name, num_employees, description)
    VALUES ('apple', 'Apple', 1, 'This is Apple');

INSERT INTO companies (handle, name, num_employees, description)
    VALUES ('google', 'Google', 5, 'This is Google');

INSERT INTO companies (handle, name, num_employees, description)
    VALUES ('ibm', 'IBM', 3, 'This is IBM');
