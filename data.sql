DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
  handle text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  num_employees int,
  description text,
  logo_url text
);

INSERT INTO companies (handle, name)
    VALUES ('apple', 'Apple')

INSERT INTO companies (handle, name)
    VALUES ('google', 'Google')

INSERT INTO companies (handle, name)
    VALUES ('ibm', 'IBM')
