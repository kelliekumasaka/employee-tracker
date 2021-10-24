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
    "sales manager",
    70000,
    2,
    1
),
(
    "marketing representative",
    58000,
    3,
    6
),
(
    "digital marketing specialist",
    60000,
    4,
    6
),
(
    "customer service representative",
    55000,
    5,
    2
),
(
    "claims intake representative",
    68000,
    6,
    3
),
(
    "junior legal specialist",
    85000,
    7,
    3
),
(
    "senior lawyer",
    120000,
    8,
    3
),
(
    "front-end web developer",
    80000,
    9,
    4
),
(
    "HR representative",
    60000,
    10,
    5
)
;


INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES
(
    "Narumi", 
    "Kato", 
    3,
    NULL
),
(
    "Donald",
    "Evans",
    4,
    NULL
),
(
    "Emily",
    "Kim",
    3,
    1
),
(
    "Abby",
    "Yeo",
    8,
    NULL
),
(
    "Greg",
    "Mun",
    9,
    NULL
),
(
    "Tyshawn",
    "Jordan",
    7,
    4
),
(
    "Justin",
    "Hsie",
    9,
    5
),
(
    "Megan",
    "Lee",
    10,
    NULL
),
(
    "Chris",
    "Hwang", 
    6,
    4
),
(
    "Carl",
    "Hensen",
    5,
    NULL
),
(
    "Nyle",
    "Miura",
    2,
    NULL
),
(
    "Milton",
    "Martinez",
    1,
    11
)