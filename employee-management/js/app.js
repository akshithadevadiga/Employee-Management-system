import { DataService } from './services/DataService.js';
import { TableComponent } from './components/TableComponent.js';
import { SearchComponent } from './components/SearchComponent.js';
import { PaginationComponent } from './components/PaginationComponent.js';
import { exportToCSV, exportToJSON } from './utils/helpers.js';

class EmployeeManagementApp {
    constructor() {
        this.dataService = new DataService();
        this.tableComponent = null;
        this.searchComponent = null;
        this.paginationComponent = null;
        this.selectedDepartments = [];
        this.searchQuery = '';
        this.itemsPerPage = 10;
        
        this.init();
    }

    async init() {
        try {
            this.initializeComponents();
            this.attachEventListeners();
            await this.loadInitialData();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load employees. Please refresh the page.');
        }
    }

    initializeComponents() {
        this.tableComponent = new TableComponent('tableComponent', {
            itemsPerPage: this.itemsPerPage,
            onDelete: (id) => this.handleDeleteEmployee(id)
        });

        this.searchComponent = new SearchComponent('searchComponent', {
            onSearch: (query) => this.handleSearch(query)
        });

        this.paginationComponent = new PaginationComponent('paginationComponent', {
            itemsPerPage: this.itemsPerPage,
            onPageChange: (page) => this.handlePageChange(page)
        });

        this.initializeDepartmentFilter();
    }

    initializeDepartmentFilter() {
        const container = document.getElementById('departmentFilter');
        if (!container) return;

        container.innerHTML = `
            <label class="filter-label">Filter by Department</label>
            <div class="department-checkboxes" id="departmentCheckboxes"></div>
        `;

        this.departmentCheckboxes = document.getElementById('departmentCheckboxes');
    }

    updateDepartmentFilter() {
        if (!this.departmentCheckboxes) return;

        const departments = this.dataService.getDepartments();
        
        if (departments.length === 0) {
            this.departmentCheckboxes.innerHTML = '<p style="padding: 8px; color: var(--text-secondary);">No departments available</p>';
            return;
        }

        this.departmentCheckboxes.innerHTML = departments.map(dept => `
            <div class="checkbox-item">
                <input 
                    type="checkbox" 
                    id="dept_${dept}" 
                    value="${dept}"
                    ${this.selectedDepartments.includes(dept) ? 'checked' : ''}
                >
                <label for="dept_${dept}">${dept}</label>
            </div>
        `).join('');

        const checkboxes = this.departmentCheckboxes.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleDepartmentFilterChange(e.target.value, e.target.checked);
            });
        });
    }

    handleDepartmentFilterChange(department, isChecked) {
        if (isChecked) {
            if (!this.selectedDepartments.includes(department)) {
                this.selectedDepartments.push(department);
            }
        } else {
            this.selectedDepartments = this.selectedDepartments.filter(dept => dept !== department);
        }
        this.updateFilteredView();
    }

    attachEventListeners() {
        const addEmployeeBtn = document.getElementById('addEmployeeBtn');
        const exportCSVBtn = document.getElementById('exportCSVBtn');
        const exportJSONBtn = document.getElementById('exportJSONBtn');
        const employeeModal = document.getElementById('employeeModal');
        const deleteModal = document.getElementById('deleteModal');
        const employeeForm = document.getElementById('employeeForm');
        const closeModalBtns = document.querySelectorAll('.close-modal');
        const cancelBtns = document.querySelectorAll('.cancel-btn, .cancel-delete');
        const confirmDeleteBtn = document.querySelector('.confirm-delete');

        if (addEmployeeBtn) {
            addEmployeeBtn.addEventListener('click', () => this.openAddEmployeeModal());
        }

        if (exportCSVBtn) {
            exportCSVBtn.addEventListener('click', () => this.handleExportCSV());
        }

        if (exportJSONBtn) {
            exportJSONBtn.addEventListener('click', () => this.handleExportJSON());
        }

        if (employeeForm) {
            employeeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddEmployee(e.target);
            });
        }

        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal(employeeModal);
                this.closeModal(deleteModal);
            });
        });

        cancelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal(employeeModal);
                this.closeModal(deleteModal);
            });
        });

        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        }

        window.addEventListener('click', (e) => {
            if (e.target === employeeModal) {
                this.closeModal(employeeModal);
            }
            if (e.target === deleteModal) {
                this.closeModal(deleteModal);
            }
        });

        this.dataService.subscribe(() => {
            this.updateFilteredView();
            this.updateDepartmentFilter();
        });
    }

    async loadInitialData() {
        await this.dataService.loadEmployees();
        this.updateFilteredView();
        this.updateDepartmentFilter();
    }

    handleSearch(query) {
        this.searchQuery = query;
        this.updateFilteredView();
    }

    updateFilteredView() {
        const filtered = this.dataService.getFilteredEmployees(
            this.searchQuery,
            this.selectedDepartments
        );

        this.tableComponent.setFilteredData(filtered);
        this.paginationComponent.setTotalItems(filtered.length);
        
        const currentPage = this.paginationComponent.getCurrentPage();
        this.tableComponent.setCurrentPage(currentPage);
    }

    handlePageChange(page) {
        this.tableComponent.setCurrentPage(page);
    }

    openAddEmployeeModal() {
        const modal = document.getElementById('employeeModal');
        const form = document.getElementById('employeeForm');
        
        if (form) {
            form.reset();
        }
        
        this.showModal(modal);
    }

    async handleAddEmployee(form) {
        const formData = new FormData(form);
        const employeeData = {
            name: formData.get('name'),
            email: formData.get('email'),
            role: formData.get('role'),
            department: formData.get('department'),
            salary: parseFloat(formData.get('salary')) || 0
        };

        try {
            await this.dataService.addEmployee(employeeData);
            this.closeModal(document.getElementById('employeeModal'));
            this.showSuccess('Employee added successfully!');
        } catch (error) {
            console.error('Failed to add employee:', error);
            this.showError('Failed to add employee. Please try again.');
        }
    }

    handleDeleteEmployee(id) {
        const allEmployees = this.dataService.getAllEmployees();
        const employee = allEmployees.find(emp => emp.id === id);
        if (!employee) return;

        const modal = document.getElementById('deleteModal');
        const preview = document.getElementById('deleteEmployeePreview');
        
        if (preview) {
            preview.innerHTML = `
                <p><strong>Name:</strong> ${employee.name}</p>
                <p><strong>Email:</strong> ${employee.email}</p>
                <p><strong>Role:</strong> ${employee.role}</p>
                <p><strong>Department:</strong> ${employee.department}</p>
            `;
        }

        this.deleteEmployeeId = id;
        this.showModal(modal);
    }

    async confirmDelete() {
        if (!this.deleteEmployeeId) return;

        try {
            await this.dataService.removeEmployee(this.deleteEmployeeId);
            this.closeModal(document.getElementById('deleteModal'));
            this.showSuccess('Employee deleted successfully!');
            this.deleteEmployeeId = null;
        } catch (error) {
            console.error('Failed to delete employee:', error);
            this.showError('Failed to delete employee. Please try again.');
        }
    }

    handleExportCSV() {
        const employees = this.dataService.getFilteredEmployees(
            this.searchQuery,
            this.selectedDepartments
        );
        
        if (employees.length === 0) {
            this.showError('No employees to export.');
            return;
        }

        const exportData = employees.map(emp => ({
            Name: emp.name,
            Email: emp.email,
            Role: emp.role,
            Department: emp.department,
            Salary: emp.salary,
            'Created At': emp.createdAt
        }));

        exportToCSV(exportData, 'employees.csv');
        this.showSuccess('CSV exported successfully!');
    }

    handleExportJSON() {
        const employees = this.dataService.getFilteredEmployees(
            this.searchQuery,
            this.selectedDepartments
        );
        
        if (employees.length === 0) {
            this.showError('No employees to export.');
            return;
        }

        const exportData = employees.map(emp => {
            if (emp.toJSON && typeof emp.toJSON === 'function') {
                return emp.toJSON();
            }
            return {
                id: emp.id,
                name: emp.name,
                email: emp.email,
                role: emp.role,
                department: emp.department,
                salary: emp.salary,
                createdAt: emp.createdAt
            };
        });
        exportToJSON(exportData, 'employees.json');
        this.showSuccess('JSON exported successfully!');
    }

    showModal(modal) {
        if (modal) {
            modal.classList.add('show');
        }
    }

    closeModal(modal) {
        if (modal) {
            modal.classList.remove('show');
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'};
            color: white;
            border-radius: 6px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    .pagination-buttons {
        display: flex;
        gap: 4px;
        align-items: center;
    }
    .pagination-ellipsis {
        padding: 0 8px;
        color: var(--text-secondary);
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    new EmployeeManagementApp();
});

