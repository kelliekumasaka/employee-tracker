// link all the needed docs and functions here
const inquirer = require('inquirer');
const mysql = require('mysql2');

const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'company_db'
    },
    console.log(`Connected to the company_db database.`)
);

const main = () => {
    inquirer.prompt({
        type: 'list',
        message: 'What would you like to do?',
        name: 'options',
        choices: ['View all departments', 'View all roles', 'View all employees', 'View all employees by manager','View all employees by department', 'Add an employee', 'Add a department', 'Add a role', 'Update an employee role', 'Update employee manager', 'Quit']
    }).then((data => {
        if(data.options === 'View all departments'){
            db.query('SELECT id, name FROM department', (err, data) => {
                if (err) {
                  throw err;
                }else {
                  console.table(data);
                  main();
                }
            })
        }else if(data.options === 'View all roles'){
            db.query('SELECT role.id, title, name AS department, salary FROM role LEFT JOIN department ON role.department_id = department.id', (err, data) => {
                if(err){
                    throw err;
                }else{
                    console.table(data);
                    main();
                }
            })
        }else if(data.options === 'View all employees'){
            db.query('SELECT e.id, e.first_name, e.last_name, title, name AS department, salary, concat(m.first_name, " ", m.last_name) AS manager FROM employee e LEFT JOIN role ON e.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee m ON m.id = e.manager_id ORDER BY e.id ASC', (err, data) => {
                if(err){
                    throw err;
                }else{
                    console.table(data);
                    main();
                }
            })
        }else if(data.options === 'View all employees by manager'){
            findEmployees().then(([columns]) => {
                function getManagers(columns){
                    if(columns.manager_id === null){
                        return columns;
                    };
                };
                const managers = columns.filter(getManagers).map(row => ({
                    name:`${row.first_name} ${row.last_name}`,
                    id:row.id
                }));
                inquirer.prompt({
                    type:'list',
                    message:'Choose a manager to view direct reports',
                    name:'managerChoice',
                    choices:managers
                }).then(data => {
                    const userManager = managers.filter(manager => manager.name === data.managerChoice)[0];
                    db.query('SELECT e.id, e.first_name, e.last_name, title, name AS department, salary, concat(m.first_name, " ", m.last_name) AS manager FROM employee e LEFT JOIN role ON e.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee m ON m.id = e.manager_id WHERE e.manager_id = ? ORDER BY e.id ASC', userManager.id, (err, data) => {
                        if(err){
                            throw err
                        }else if(data.length === 0){
                            console.log("No direct reports");
                            main()
                        }else{
                            console.table(data);
                            main()
                        }
                    })
                })
            })
        }else if(data.options === 'View all employees by department'){
            findDepartment().then(([rows]) => {
                const departments = rows.map(row => ({
                    name:row.name,
                    id:row.id
                }));
                inquirer.prompt({
                    type:"list",
                    name:"department_name",
                    message:"Choose a department to view employees",
                    choices:departments
                }).then(data => {
                    const departmentId = departments.filter(department => department.name === data.department_name)[0];
                    db.query('SELECT e.id, e.first_name, e.last_name, title, name AS department, salary, concat(m.first_name, " ", m.last_name) AS manager FROM employee e LEFT JOIN role ON e.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee m ON m.id = e.manager_id WHERE department.id = ? ORDER BY e.id ASC', departmentId.id, (err, data) => {
                        if(err){
                            throw err
                        }else if(data.length === 0){
                            console.log("This is not the department you are looking for");
                            main()
                        }else{
                            console.table(data);
                            main()
                        }
                    })
                })
            })
        }else if(data.options === 'Add an employee'){
            inquirer.prompt([
                {
                    type:'input',
                    message:"Enter new employee's first name",
                    name:'first_name'
                },
                {
                    type:'input',
                    message:"Enter new employee's last name",
                    name:'last_name'
                }
            ]).then(data => {
                let firstName = data.first_name;
                let lastName = data.last_name;
                findRoles().then(([rows]) => {
                    const roles = rows.map(row => ({
                        name:row.title,
                        id:row.id
                    }));
                    inquirer.prompt({
                        type:'list',
                        message:'Choose a role',
                        name:'role',
                        choices:roles
                    }).then(data => {
                        let roleId = data.role;
                        findEmployees().then(([columns]) => {
                            function getManagers(columns){
                                if(columns.manager_id === null){
                                    return columns;
                                };
                            };
                            const managers = columns.filter(getManagers).map(row => ({
                                name:`${row.first_name} ${row.last_name}`,
                                id:row.id
                            }));
                            inquirer.prompt({
                                type:'list',
                                message:'Choose a manager to assign to',
                                name:'manager',
                                choices:[...managers, 'None']
                            }).then(data => {
                                if(data.manager==='None'){
                                    db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${firstName}','${lastName}',(SELECT id FROM role WHERE title='${roleId}'), NULL)`, (err, data) => {
                                        if(err){
                                            throw err;
                                        }else{
                                            console.log("Manager added");
                                            main();
                                        }
                                    })
                                }else{
                                    const managerId = managers.filter(manager => manager.name === data.manager)[0];
                                    db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${firstName}','${lastName}',(SELECT id FROM role WHERE title='${roleId}'), ${managerId.id})`, (err, data) => {
                                        if(err){
                                            throw err;
                                        }else{
                                            console.log("Employee added");
                                            main();
                                        }
                                    })
                                }
                            })
                        })
                    })
                })
            })
        }else if(data.options === "Add a department"){
            inquirer.prompt(
                {
                    type:'input',
                    name:'department',
                    message:'Insert name of new department'
                }
            ).then(data => {
                db.query('INSERT INTO department (name) VALUES (?)', data.department, (err, data) => {
                    if(err){
                        throw err;
                    }else{
                        console.log("Department added");
                        main();
                    }
                })
            })
        }else if(data.options === 'Add a role'){
            inquirer.prompt([
                {
                    type:"input",
                    name:"role",
                    message:"What is the name of the role?"
                },
                {
                    type:"number",
                    name:"salary",
                    message:"What is the salary of the role?"
                }
            ]).then(data => {
                let role = data.role;
                let salary = data.salary;
                findDepartment().then(([rows]) => {
                    const departments = rows.map(row => ({
                        name:row.name,
                        id:row.id
                    }));
                    inquirer.prompt({
                        type:"list",
                        name:"department_name",
                        message:"Which department does the role belong to?",
                        choices:departments
                    }).then(data => {
                        db.query(`INSERT INTO role (title, salary, department_id) VALUES ('${role}',${salary},(SELECT id FROM department WHERE name='${data.department_name}'))`, (err, data) => {
                            if(err){
                                throw err;
                            }else{
                                console.log("Role added");
                                main();
                            }
                        })
                    })
                })
            })
        }else if(data.options === "Update an employee role"){
            findEmployees().then(([rows]) => {
                const employees = rows.map(row => ({
                    name:`${row.first_name} ${row.last_name}`,
                    id:row.id
                }));
                inquirer.prompt({
                    type:'list',
                    name:"employeeName",
                    message:"Which employee's role would you like to update?",
                    choices:employees
                }).then(data => {
                    const employeeId = employees.filter(employee => employee.name === data.employeeName)[0];
                    findRoles().then(([rows]) => {
                        const roles = rows.map(row => ({
                            name:row.title,
                            id:row.id
                        }));
                        inquirer.prompt({
                            type:'list',
                            name:'roleName',
                            message:"Which role would you like to assign this employee to?",
                            choices:roles
                        }).then(data => {
                            const roleId = roles.filter(role => role.name === data.roleName)[0];
                            db.query(`UPDATE employee SET role_id = ? WHERE employee.id= ?`,[roleId.id, employeeId.id], (err, data) => {
                                if(err){
                                    throw err;
                                }else{
                                    console.log("Employee updated");
                                    main();
                                }
                            })
                        })
                    })
                })
            })
        }else if(data.options === 'Update employee manager'){
            findEmployees().then(([rows]) => {
                const employees = rows.map(row => ({
                    name:`${row.first_name} ${row.last_name}`,
                    id:row.id
                }));
                inquirer.prompt({
                    type:'list',
                    name:"employeeName",
                    message:"Which employee's manager would you like to update?",
                    choices:employees
                }).then(data => {
                    const employeeId = employees.filter(employee => employee.name === data.employeeName)[0];
                    findEmployees().then(([columns]) => {
                        function getManagers(columns){
                            if(columns.manager_id === null){
                                return columns;
                            };
                        };
                        const managers = columns.filter(getManagers).map(row => ({
                            name:`${row.first_name} ${row.last_name}`,
                            id:row.id
                        }));
                        inquirer.prompt({
                            type:'list',
                            message:'Choose a manager to assign to',
                            name:'manager',
                            choices:[...managers, 'None']
                        }).then(data => {
                            const myManager = managers.filter(manager => manager.name === data.manager)[0];
                            if(data.manager === 'None' || myManager.id === employeeId.id){
                                db.query('UPDATE employee SET manager_id = NULL WHERE id = ?', employeeId.id, (err,data) => {
                                    if(err){
                                        throw err
                                    }else{
                                        console.log(`${employeeId.name} is now a manager!`);
                                        main()
                                    }
                                })
                            }else{
                                db.query('UPDATE employee SET manager_id = ? WHERE id = ?', [myManager.id, employeeId.id], (err, data) => {
                                    if(err){
                                        throw err
                                    }else{
                                        console.log(`${employeeId.name} has been assigned a manager`);
                                        main()
                                    }
                                })
                            }
                        })
                    })
                })
            })
        }else{
            console.log('Goodbye!');
            db.end()
        }
    }))
}

const findRoles = () => db.promise().query('SELECT * FROM role');

const findEmployees = () => db.promise().query('SELECT * FROM employee');

const findDepartment = () => db.promise().query('SELECT * FROM department');

main();