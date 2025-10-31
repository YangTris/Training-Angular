import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { Product, PaginatedResult } from '../../../shared/models';

/**
 * Product List Component
 * Displays paginated list of products with search and sorting
 */
@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  // Data properties
  products: Product[] = [];

  // Pagination properties
  currentPage = 1;
  pageSize = 8;
  totalPages = 0;
  totalItems = 0;

  // UI state properties
  loading = false;
  errorMessage = '';
  searchTerm = '';
  sortBy = 'createdAt'; // Use lowercase to match HTML options
  isDescending = true;

  constructor(private productService: ProductService) {}

  /**
   * Lifecycle hook - called when component initializes
   * Load products on component initialization
   */
  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * Load products from API with current pagination and search settings
   */
  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';

    // Map frontend sort values to backend API field names
    const sortFieldMap: { [key: string]: string } = {
      name: 'Name',
      price: 'Price',
      createdAt: 'CreatedAt',
    };

    // Call the service with pagination parameters
    this.productService
      .getProducts({
        pageNumber: this.currentPage,
        pageSize: this.pageSize,
        searchTerm: this.searchTerm || undefined,
        sortBy: sortFieldMap[this.sortBy] || 'CreatedAt', // Map to API field name
        isDescending: this.isDescending,
      })
      .subscribe({
        // Success handler
        next: (result: PaginatedResult<Product>) => {
          this.products = result.items;
          this.totalPages = result.totalPages;
          this.totalItems = result.totalItems;
          this.loading = false;
        },
        // Error handler
        error: (error) => {
          console.error('Error loading products:', error);
          this.errorMessage = 'Failed to load products. Please try again.';
          this.loading = false;
        },
      });
  }

  /**
   * Handle search input changes
   * Reset to page 1 when searching
   */
  onSearch(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  /**
   * Navigate to previous page
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  /**
   * Navigate to next page
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  /**
   * Navigate to specific page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  /**
   * Get array of page numbers for pagination display
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5; // Show max 5 page numbers

    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);

    // Adjust start if we're near the end
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Handle sort field or direction changes
   * Reset to page 1 when sorting changes
   */
  onSortChange(): void {
    this.currentPage = 1; // Reset to first page when sorting changes
    this.loadProducts();
  }

  /**
   * Toggle sort direction (ascending/descending)
   */
  toggleSortDirection(): void {
    this.isDescending = !this.isDescending;
    this.currentPage = 1;
    this.loadProducts();
  }
}
