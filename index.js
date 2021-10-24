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
// using inquirer, ask user questions about what they want to know
// depending on answers, have system run terminal function to show different databases or add to tables within certain databases

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
            db.query('SELECT * FROM role', (err, data) => {
                if(err){
                    throw err;
                }else{
                    console.table(data);
                    main();
                }
            })
        }else if (data.options === 'View all employees'){
            db.query('SELECT * FROM employee', (err, data) => {
                if(err){
                    throw err;
                }else{
                    console.table(data);
                    main();
                }
            })
        } else if (data.options === 'Add an employee'){
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
                        var roleId = data.role;
                        // INSERT INTO employee 
                        findEmployees().then(([columns]) => {
                            function getManagers(columns){
                                if(columns.manager_id === null){
                                    return columns;
                                };
                            };
                            let managers = columns.filter(getManagers);
                            let allManagers = managers.map(row => ({
                                name:`${row.first_name} ${row.last_name}`,
                                id:row.id
                            }))
                            inquirer.prompt({
                                type:'list',
                                message:'Choose a manager to assign to',
                                name:'manager',
                                choices:allManagers
                            }).then(data => {
                                console.log(data);
                                console.log(roleId);
                                console.log(firstName);
                                console.log(lastName);
                                main();
                            });
                        })
                    })
                });
            }) 
        } else if(data.choices === "Add a department"){
            inquirer.prompt([
                {
                    type:'input',
                    name:'department',
                    message:'Insert name of new department'
                }
            ]).then(data => {
                db.query('INSERT INTO department ')
            })
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