import { Employee } from './Employee.js';

export class EmployeeCollection {
    constructor() {
        this.employees = [];
    }

    add(employeeData) {
        const employee = employeeData instanceof Employee 
            ? employeeData 
            : new Employee(employeeData);
        this.employees.push(employee);
        return employee;
    }

    remove(id) {
        const index = this.employees.findIndex(emp => emp.id === id);
        if (index !== -1) {
            return this.employees.splice(index, 1)[0];
        }
        return null;
    }

    getById(id) {
        return this.employees.find(emp => emp.id === id);
    }

    getAll() {
        return [...this.employees];
    }

    clear() {
        this.employees = [];
    }

    setEmployees(employeesData) {
        this.clear();
        employeesData.forEach(data => this.add(data));
    }

    filter(searchQuery, selectedDepartments) {
        return this.employees.filter(employee => {
            const matchesSearch = !searchQuery || employee.matchesSearch(searchQuery);
            const matchesDepartment = employee.matchesDepartments(selectedDepartments);
            return matchesSearch && matchesDepartment;
        });
    }

    getDepartments() {
        const departments = new Set(this.employees.map(emp => emp.department));
        return Array.from(departments).sort();
    }

    getCount() {
        return this.employees.length;
    }
}

