import { EmployeeCollection } from '../models/EmployeeCollection.js';
import { EmployeeAPI } from '../api/EmployeeAPI.js';

export class DataService {
    constructor() {
        this.api = new EmployeeAPI();
        this.collection = new EmployeeCollection();
        this.listeners = [];
    }

    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback);
        };
    }

    notify() {
        this.listeners.forEach(callback => callback(this.collection.getAll()));
    }

    async loadEmployees() {
        try {
            const employees = await this.api.fetchEmployees();
            this.collection.setEmployees(employees);
            this.notify();
            return employees;
        } catch (error) {
            console.error('Failed to load employees:', error);
            throw error;
        }
    }

    async addEmployee(employeeData) {
        try {
            await this.api.createEmployee(employeeData);
            const employee = this.collection.add(employeeData);
            this.notify();
            return employee;
        } catch (error) {
            console.error('Failed to add employee:', error);
            throw error;
        }
    }

    async removeEmployee(id) {
        try {
            await this.api.deleteEmployee(id);
            const employee = this.collection.remove(id);
            this.notify();
            return employee;
        } catch (error) {
            console.error('Failed to remove employee:', error);
            throw error;
        }
    }

    getFilteredEmployees(searchQuery, selectedDepartments) {
        return this.collection.filter(searchQuery, selectedDepartments);
    }

    getAllEmployees() {
        return this.collection.getAll();
    }

    getDepartments() {
        return this.collection.getDepartments();
    }
}

