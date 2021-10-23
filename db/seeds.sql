USE company_db;

INSERT INTO department(id, name) VALUES
(
    1, "sales"
),
(
    2, "customer service"
),
(   
    3, "legal"
),
(    
    4, "system operations"
),
(
    5, "HR"
),
(
    6, "marketing"
); 

INSERT INTO role(title, salary, id, department_id) VALUES
(
    "sales associate",
    58000,
    1,
    1
),
(
    "marketing representative",
    58000,
    2,
    6
);

INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES
(
    "Narumi", 
    "Kato", 
    2,
    1
);

INSERT INTO employee(first_name, last_name, role_id) VALUES
(
    "Emily",
    "Mitchell",
    2
);
