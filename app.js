const cTable = require('console.table');
var fs = require('fs');
const inquirer = require("inquirer");
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'password',
  multipleStatements: true
});

var actions = [
    {
        type: "list",
        message: "What would you like to do?",
        name: "action",
        choices: [
            {
                name: "View All Employees",
                value: "viewAll"  
            },
            {
                name: "Add Deparment",
                value: "addDepartment"  
            },
            {
                name: "Add Role",
                value: "addRole"  
            },
            {
                name: "Add Employee",
                value: "addEmployee"
            },
            {
                name: "Update Role",
                value: "updateRole"
            }
        ]
    },
];



function ask () {
    inquirer.prompt(actions).then(answers => {

        if (answers.action == "viewAll") {
            const viewAllSql = fs.readFileSync(__dirname + "/viewAll.sql", 'utf8');
            connection.query(viewAllSql, function(err, results) {
                if (err) throw err;
                console.table(results);
                ask();
              });
        }
        
        if (answers.action == "updateRole") {
            var updateRole = [
                {
                    type: "list",
                    message: "Which employee?",
                    name: "employee_id",
                    choices: []
                },
                {
                    type: "list",
                    message: "Which role?",
                    name: "role_id",
                    choices: []
                }
            ];

            connection.query("SELECT id as value, concat(first_name, \" \", last_name) as name FROM employee", function(err, employees) {
                updateRole[0].choices = employees;
                connection.query("SELECT id as value, title as name FROM role", function(err, roles) {
                    updateRole[1].choices = roles;

                    inquirer.prompt(updateRole).then(role => {
                        console.log(role);
                        var query = connection.query('UPDATE employee SET role_id = ? WHERE id = ?', [role.role_id, role.employee_id], function (error, results, fields) {
                            ask();
                          });
                    });
                });
            });

        }
        
        if (answers.action == "addDepartment") {
            var addDepartment = [
                {
                    type: "input",
                    message: "What's department name?",
                    name:"name"
                },
            ];

            inquirer.prompt(addDepartment).then(department => {
                var query = connection.query('INSERT INTO department SET ?', department, function (error, results, fields) {
                    if (error) throw error;
                    ask();
                  });
            });
        }

        if (answers.action == "addRole") {
            var addRole = [
                {
                    type: "input",
                    message: "What's title?",
                    name:"title"
                },
                {
                    type: "input",
                    message: "What's salary?",
                    name:"salary"
                },
                {
                    type: "list",
                    message: "Which department?",
                    name: "department_id",
                    choices: []
                },
            ];

            connection.query("SELECT id as value, name as name FROM department",
            function(err, departments) {
                addRole[2].choices = departments
                inquirer.prompt(addRole).then(role => {
                    var query = connection.query('INSERT INTO role SET ?', role, function (error, results, fields) {
                        ask();
                      });
                });
            });
        }

        if (answers.action == "addEmployee") {
            var addEmployee = [
                {
                    type: "input",
                    message: "What's first name?",
                    name:"first_name"
                },
                {
                    type: "input",
                    message: "What's last name?",
                    name:"last_name"
                },
                {
                    type: "list",
                    message: "Which role?",
                    name: "role_id",
                    choices: []
                },
                {
                    type: "list",
                    message: "Who's the manager?",
                    name: "manager_id",
                    choices: []
                }
            ];

            connection.query("SELECT id as value, title as name FROM role",
            function(err, roles) {
                addEmployee[2].choices = roles;
                connection.query("SELECT id as value, concat(first_name, \" \", last_name) as name FROM employee",
                function(err, managers) {
                    addEmployee[3].choices = managers;
                    addEmployee[3].choices.push({name: "None", value: null});
                    inquirer.prompt(addEmployee).then(employee => {
                        var query = connection.query('INSERT INTO employee SET ?', employee,
                        function (error, results, fields) {
                            ask();
                        });
                    });
                });
            });
        }
    })
};


connection.connect();

const seed = fs.readFileSync(__dirname + "/seed.sql", 'utf8');

connection.query(seed, function(err, results) {
    if (err) throw err;
});

ask();
