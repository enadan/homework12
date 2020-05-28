SELECT e.id, e.first_name, e.last_name, r.title, r.salary, d.name as departmnet, concat(m.first_name, " ", m.last_name) as manager
FROM employee e
	LEFT JOIN role r ON r.id = e.role_id
    LEFT JOIN department d on d.id = r.department_id
    LEFT JOIN employee m ON m.id = e.manager_id;