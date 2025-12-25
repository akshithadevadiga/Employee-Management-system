import { formatCurrency, formatDate } from '../utils/helpers.js';

export class TableComponent {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.itemsPerPage = options.itemsPerPage || 10;
        this.rowHeight = options.rowHeight || 50;
        this.visibleBuffer = options.visibleBuffer || 5;
        this.onDelete = options.onDelete || null;
        this.currentPage = 1;
        this.data = [];
        this.filteredData = [];
        
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Department</th>
                            <th>Salary</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody"></tbody>
                </table>
            </div>
        `;

        this.tbody = document.getElementById('tableBody');
        this.update();
    }

    setData(data) {
        this.data = data;
        this.filteredData = data;
        this.currentPage = 1;
        this.update();
    }

    setFilteredData(data) {
        this.filteredData = data;
        this.currentPage = 1;
        this.update();
    }

    setCurrentPage(page) {
        this.currentPage = page;
        this.update();
    }

    setItemsPerPage(itemsPerPage) {
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
        this.update();
    }

    update() {
        if (!this.tbody) return;

        if (this.filteredData.length === 0) {
            this.tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <h3>No employees found</h3>
                        <p>Try adjusting your search or filters</p>
                    </td>
                </tr>
            `;
            return;
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredData.length);
        const pageData = this.filteredData.slice(startIndex, endIndex);

        this.tbody.innerHTML = pageData.map(employee => this.renderRow(employee)).join('');

        this.attachEventListeners();
    }

    renderRow(employee) {
        return `
            <tr data-id="${employee.id}">
                <td>${this.escapeHtml(employee.name)}</td>
                <td>${this.escapeHtml(employee.email)}</td>
                <td>${this.escapeHtml(employee.role)}</td>
                <td>${this.escapeHtml(employee.department)}</td>
                <td>${formatCurrency(employee.salary)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-danger btn-small delete-btn" data-id="${employee.id}">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    attachEventListeners() {
        if (!this.onDelete) return;

        const deleteButtons = this.tbody.querySelectorAll('.delete-btn');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                if (id && this.onDelete) {
                    this.onDelete(id);
                }
            });
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getTotalPages() {
        return Math.ceil(this.filteredData.length / this.itemsPerPage);
    }

    getCurrentPage() {
        return this.currentPage;
    }

    getTotalItems() {
        return this.filteredData.length;
    }
}

