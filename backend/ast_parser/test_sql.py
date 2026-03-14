# test_sql_parser.py

from parser_utils.sql_parser import parse_sql

sample = """
CREATE TABLE users (
    user_id     INT PRIMARY KEY,
    username    VARCHAR(50),
    email       VARCHAR(100),
    created_at  TIMESTAMP
);

CREATE TABLE orders (
    order_id    INT PRIMARY KEY,
    user_id     INT,
    total_price DECIMAL(10,2),
    status      VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
"""

results = parse_sql(sample, "db/schema.sql")
for r in results:
    # Print only what the user wants to see in the test output
    if r["kind"] == "table":
        print(f'{{"name": "{r["name"]}",       "kind": "table",  "line": {r["line"]}}}')
    else:
        print(f'{{"name": "{r["name"]}",     "kind": "column", "table": "{r["table"]}",  "line": {r["line"]}}}')
