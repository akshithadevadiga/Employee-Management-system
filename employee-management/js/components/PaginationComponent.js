export class PaginationComponent {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.onPageChange = options.onPageChange || null;
        this.itemsPerPage = options.itemsPerPage || 10;
        this.maxVisiblePages = options.maxVisiblePages || 5;
        this.currentPage = 1;
        this.totalItems = 0;
        
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        if (!this.container) return;

        const totalPages = this.getTotalPages();
        
        if (totalPages <= 1) {
            this.container.innerHTML = `
                <div class="pagination-info">
                    Showing ${this.getStartIndex() + 1}-${this.getEndIndex()} of ${this.totalItems} employees
                </div>
            `;
            return;
        }

        const pageButtons = this.generatePageButtons(totalPages);
        
        this.container.innerHTML = `
            <div class="pagination-info">
                Showing ${this.getStartIndex() + 1}-${this.getEndIndex()} of ${this.totalItems} employees
            </div>
            <div class="pagination-buttons">
                <button class="pagination-btn" data-page="prev" ${this.currentPage === 1 ? 'disabled' : ''}>
                    Previous
                </button>
                ${pageButtons}
                <button class="pagination-btn" data-page="next" ${this.currentPage === totalPages ? 'disabled' : ''}>
                    Next
                </button>
            </div>
        `;
    }

    generatePageButtons(totalPages) {
        const buttons = [];
        const startPage = Math.max(1, this.currentPage - Math.floor(this.maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + this.maxVisiblePages - 1);

        if (startPage > 1) {
            buttons.push(`<button class="pagination-btn" data-page="1">1</button>`);
            if (startPage > 2) {
                buttons.push(`<span class="pagination-ellipsis">...</span>`);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === this.currentPage ? 'active' : '';
            buttons.push(`<button class="pagination-btn ${activeClass}" data-page="${i}">${i}</button>`);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                buttons.push(`<span class="pagination-ellipsis">...</span>`);
            }
            buttons.push(`<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`);
        }

        return buttons.join('');
    }

    attachEventListeners() {
        const buttons = this.container.querySelectorAll('.pagination-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.getAttribute('data-page');
                this.handlePageClick(page);
            });
        });
    }

    handlePageClick(page) {
        const totalPages = this.getTotalPages();
        
        if (page === 'prev') {
            if (this.currentPage > 1) {
                this.setCurrentPage(this.currentPage - 1);
            }
        } else if (page === 'next') {
            if (this.currentPage < totalPages) {
                this.setCurrentPage(this.currentPage + 1);
            }
        } else {
            const pageNum = parseInt(page, 10);
            if (pageNum >= 1 && pageNum <= totalPages) {
                this.setCurrentPage(pageNum);
            }
        }
    }

    setCurrentPage(page) {
        this.currentPage = page;
        this.render();
        this.attachEventListeners();
        
        if (this.onPageChange) {
            this.onPageChange(page);
        }
    }

    setTotalItems(total) {
        this.totalItems = total;
        const totalPages = this.getTotalPages();
        if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = totalPages;
        }
        this.render();
        this.attachEventListeners();
    }

    setItemsPerPage(itemsPerPage) {
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
        this.render();
        this.attachEventListeners();
    }

    getTotalPages() {
        return Math.ceil(this.totalItems / this.itemsPerPage);
    }

    getCurrentPage() {
        return this.currentPage;
    }

    getStartIndex() {
        return (this.currentPage - 1) * this.itemsPerPage;
    }

    getEndIndex() {
        return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    }
}

