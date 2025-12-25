import { debounce } from '../utils/helpers.js';

export class SearchComponent {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.onSearch = options.onSearch || null;
        this.debounceDelay = options.debounceDelay || 300;
        this.currentQuery = '';
        
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <input 
                type="text" 
                class="search-input" 
                id="searchInput" 
                placeholder="Search by name, email, role, or department..."
                value="${this.currentQuery}"
            >
        `;

        this.input = document.getElementById('searchInput');
    }

    attachEventListeners() {
        if (!this.input) return;

        const debouncedSearch = debounce((query) => {
            this.currentQuery = query;
            if (this.onSearch) {
                this.onSearch(query);
            }
        }, this.debounceDelay);

        this.input.addEventListener('input', (e) => {
            debouncedSearch(e.target.value.trim());
        });
    }

    getQuery() {
        return this.currentQuery;
    }

    clear() {
        if (this.input) {
            this.input.value = '';
            this.currentQuery = '';
            if (this.onSearch) {
                this.onSearch('');
            }
        }
    }
}

