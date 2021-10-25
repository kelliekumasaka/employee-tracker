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
        choices: ['View all departments', 'View all roles', 'View all employees', 'Add an employee', 'Add a department', 'Add a role', 'Update an employee', 'Quit']
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
            db.query('SELECT e.id, e.first_name, e.last_name, title, name AS department, salary, concat(m.first_name, " ", m.last_name) AS manager FROM employee e JOIN role ON e.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee m ON m.id = e.manager_id', (err, data) => {
                if(err){
                    throw err;
                }else{
                    console.table(data);
                    main();
                }
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
                            const managers = columns.filter(getManagers);
                            const allManagers = managers.map(row => ({
                                name:`${row.first_name} ${row.last_name}`,
                                id:row.id
                            }))
                            inquirer.prompt({
                                type:'list',
                                message:'Choose a manager to assign to',
                                name:'manager',
                                choices:[...allManagers, 'None']
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
                                    const managerId = allManagers.filter(function(manager){
                                        if(manager.name === data.manager){
                                            return manager.id;
                                        }
                                    })[0];
                                    db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${firstName}','${lastName}',(SELECT id FROM role WHERE title='${roleId}'), ${managerId.id})`, (err, data) => {
                                        if(err){
                                            throw err;
                                        }else{
                                            console.log("Employee added");
                                            main();
                                        }
                                    })
                                }
                            });
                        })
                    })
                });
            }) 
        }else if(data.options === "Add a department"){
            inquirer.prompt(
                {
                    type:'input',
                    name:'department',
                    message:'Insert name of new department'
                }
            ).then(data => {
                db.query('INSERT INTO department (name) VALUES (?)', [data.department], (err, data) => {
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
        }else if(data.options === "Update an employee"){
            // TODO: create inquirer + functions to change an employee's data
            
        }
        else{
            console.log('Goodbye!');
            db.end()
        }
    }))
}

const findRoles = () => {
    return db.promise().query('SELECT * FROM role')
}

const findEmployees = () => {
    return db.promise().query('SELECT * FROM employee')
}

const findDepartment = () => {
    return db.promise().query('SELECT * FROM department')
}

main();