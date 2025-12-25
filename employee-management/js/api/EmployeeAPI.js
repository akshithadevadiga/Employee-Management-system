export class EmployeeAPI {
    constructor(baseUrl = 'https://jsonplaceholder.typicode.com') {
        this.baseUrl = baseUrl;
        this.cache = null;
    }

    async fetchEmployees() {
        try {
            const response = await fetch(`${this.baseUrl}/users`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const users = await response.json();
            
            return users.map((user, index) => ({
                id: `emp_${user.id}`,
                name: user.name,
                email: user.email,
                role: this.mapRoleFromIndex(index),
                department: this.mapDepartmentFromIndex(index),
                salary: this.generateSalary(index),
                createdAt: new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error fetching employees:', error);
            throw error;
        }
    }

    mapRoleFromIndex(index) {
        const roles = ['Software Engineer', 'Product Manager', 'Designer', 'Marketing Specialist', 
                      'Sales Representative', 'HR Manager', 'Finance Analyst', 'Operations Manager',
                      'QA Engineer', 'DevOps Engineer'];
        return roles[index % roles.length];
    }

    mapDepartmentFromIndex(index) {
        const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
        return departments[index % departments.length];
    }

    generateSalary(index) {
        const baseSalary = 50000;
        const variation = (index % 10) * 5000;
        return baseSalary + variation;
    }

    async createEmployee(employeeData) {
        try {
            const response = await fetch(`${this.baseUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: employeeData.name,
                    email: employeeData.email,
                    ...employeeData
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const created = await response.json();
            return {
                id: `emp_${created.id || Date.now()}`,
                name: employeeData.name,
                email: employeeData.email,
                role: employeeData.role,
                department: employeeData.department,
                salary: employeeData.salary || 0,
                createdAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error creating employee:', error);
            throw error;
        }
    }

    async deleteEmployee(id) {
        try {
            const response = await fetch(`${this.baseUrl}/users/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting employee:', error);
            throw error;
        }
    }
}

