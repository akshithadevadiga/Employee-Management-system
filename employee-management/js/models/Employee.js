export class Employee {
    constructor(data) {
        this.id = data.id || this.generateId();
        this.name = data.name || '';
        this.email = data.email || '';
        this.role = data.role || '';
        this.department = data.department || '';
        this.salary = data.salary || 0;
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    generateId() {
        return `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role,
            department: this.department,
            salary: this.salary,
            createdAt: this.createdAt
        };
    }

    matchesSearch(query) {
        const searchTerm = query.toLowerCase();
        return (
            this.name.toLowerCase().includes(searchTerm) ||
            this.email.toLowerCase().includes(searchTerm) ||
            this.role.toLowerCase().includes(searchTerm) ||
            this.department.toLowerCase().includes(searchTerm)
        );
    }

    matchesDepartments(selectedDepartments) {
        if (!selectedDepartments || selectedDepartments.length === 0) {
            return true;
        }
        return selectedDepartments.includes(this.department);
    }
}

