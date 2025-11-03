import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { AuthStore } from 'src/app/store/auth.store';
import { ProductService } from 'src/app/core/services/product.service';
import { CategoryService } from 'src/app/core/services/category.service';
import {
  Product,
  ProductDetail,
  Category,
  CreateProductRequest,
  UpdateProductRequest,
  PaginatedResult,
} from 'src/app/shared/models';

// Extended Product interface with category info
interface ProductWithCategory extends Product {
  categoryId?: string;
  categoryName?: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  userEmail: string = '';
  roles: string[] = [];

  // Product management
  products: ProductWithCategory[] = [];
  categories: Category[] = [];
  categoryMap: Map<string, string> = new Map(); // categoryId -> categoryName
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalItems = 0;

  // Search and sort
  searchTerm = '';
  sortBy = 'createdAt';
  isDescending = true;

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedProduct: Product | null = null;

  // Forms
  productForm: FormGroup;

  constructor(
    private authService: AuthService,
    private authStore: AuthStore,
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private fb: FormBuilder
  ) {
    // Initialize product form
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0.01)]],
      categoryId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Get user information from auth store
    const authState = this.authStore.getAuthValue();
    this.userEmail = authState.email || '';
    this.roles = authState.roles;

    // Verify admin access
    if (!this.roles.includes('Admin')) {
      console.warn('Non-admin user attempted to access admin page');
      this.router.navigate(['/products']);
      return;
    }

    // Load initial data
    this.loadCategories();
    this.loadProducts();
  }

  /**
   * Load categories for dropdown
   */
  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        // Build category map for quick lookup
        categories.forEach((cat) => {
          this.categoryMap.set(cat.id, cat.name);
        });
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      },
    });
  }

  /**
   * Load products with pagination and filters
   */
  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService
      .getProducts({
        pageNumber: this.currentPage,
        pageSize: this.pageSize,
        searchTerm: this.searchTerm,
        sortBy: this.sortBy,
        isDescending: this.isDescending,
      })
      .subscribe({
        next: (result: PaginatedResult<Product>) => {
          // Fetch full details for each product to get categoryId
          const productDetailRequests = result.items.map((product) =>
            this.productService.getProductById(product.id)
          );

          // Wait for all product details to load
          if (productDetailRequests.length > 0) {
            Promise.all(productDetailRequests.map((req) => req.toPromise()))
              .then((productDetails: (ProductDetail | undefined)[]) => {
                this.products = productDetails
                  .filter((pd): pd is ProductDetail => pd !== undefined)
                  .map((pd) => ({
                    ...pd,
                    categoryName:
                      this.categoryMap.get(pd.categoryId || '') || 'Unknown',
                  }));
                this.totalPages = result.totalPages;
                this.totalItems = result.totalItems;
                this.isLoading = false;
              })
              .catch((error) => {
                console.error('Error loading product details:', error);
                // Fallback to basic products without category info
                this.products = result.items;
                this.totalPages = result.totalPages;
                this.totalItems = result.totalItems;
                this.isLoading = false;
              });
          } else {
            this.products = [];
            this.totalPages = result.totalPages;
            this.totalItems = result.totalItems;
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.errorMessage = 'Failed to load products. Please try again.';
          this.isLoading = false;
        },
      });
  }

  /**
   * Search products
   */
  onSearch(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  /**
   * Change sort field
   */
  onSortChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  /**
   * Toggle sort direction
   */
  toggleSortDirection(): void {
    this.isDescending = !this.isDescending;
    this.loadProducts();
  }

  /**
   * Navigate to page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  /**
   * Open create product modal
   */
  openCreateModal(): void {
    this.productForm.reset();
    this.showCreateModal = true;
    this.clearMessages();
  }

  /**
   * Close create modal
   */
  closeCreateModal(): void {
    this.showCreateModal = false;
    this.productForm.reset();
  }

  /**
   * Open edit product modal
   */
  openEditModal(product: ProductWithCategory): void {
    this.selectedProduct = product;

    // Load full product details to get categoryId
    this.productService.getProductById(product.id).subscribe({
      next: (productDetail) => {
        this.productForm.patchValue({
          name: productDetail.name,
          description: productDetail.description || '',
          price: productDetail.price,
          categoryId: productDetail.categoryId || '',
        });
        this.showEditModal = true;
        this.clearMessages();
      },
      error: (error) => {
        console.error('Error loading product details:', error);
        this.errorMessage = 'Failed to load product details.';
      },
    });
  }

  /**
   * Close edit modal
   */
  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedProduct = null;
    this.productForm.reset();
  }

  /**
   * Open delete confirmation modal
   */
  openDeleteModal(product: ProductWithCategory): void {
    this.selectedProduct = product;
    this.showDeleteModal = true;
    this.clearMessages();
  }

  /**
   * Close delete modal
   */
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedProduct = null;
  }

  /**
   * Create new product
   */
  createProduct(): void {
    if (this.productForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const productData: CreateProductRequest = this.productForm.value;

    this.productService.createProduct(productData).subscribe({
      next: (product) => {
        console.log('Product created:', product);
        this.successMessage = `Product "${product.name}" created successfully!`;
        this.closeCreateModal();
        this.loadProducts();
        this.isLoading = false;

        // Clear success message after 3 seconds
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (error) => {
        console.error('Error creating product:', error);
        this.errorMessage =
          error.error?.message || 'Failed to create product. Please try again.';
        this.isLoading = false;
      },
    });
  }

  /**
   * Update existing product
   */
  updateProduct(): void {
    if (this.productForm.invalid || !this.selectedProduct) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const updateData: UpdateProductRequest = {
      name: this.productForm.value.name,
      description: this.productForm.value.description,
      price: this.productForm.value.price,
    };

    this.productService
      .updateProduct(this.selectedProduct.id, updateData)
      .subscribe({
        next: () => {
          console.log('Product updated');
          this.successMessage = `Product "${updateData.name}" updated successfully!`;
          this.closeEditModal();
          this.loadProducts();
          this.isLoading = false;

          // Clear success message after 3 seconds
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (error) => {
          console.error('Error updating product:', error);
          this.errorMessage =
            error.error?.message ||
            'Failed to update product. Please try again.';
          this.isLoading = false;
        },
      });
  }

  /**
   * Delete product
   */
  deleteProduct(): void {
    if (!this.selectedProduct) return;

    this.isLoading = true;
    this.errorMessage = '';

    const productName = this.selectedProduct.name;

    this.productService.deleteProduct(this.selectedProduct.id).subscribe({
      next: () => {
        console.log('Product deleted');
        this.successMessage = `Product "${productName}" deleted successfully!`;
        this.closeDeleteModal();

        // If current page is empty after delete, go to previous page
        if (this.products.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }

        this.loadProducts();
        this.isLoading = false;

        // Clear success message after 3 seconds
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        this.errorMessage =
          error.error?.message || 'Failed to delete product. Please try again.';
        this.isLoading = false;
      },
    });
  }

  /**
   * Get category name by ID
   */
  getCategoryName(categoryId: string): string {
    const category = this.categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  /**
   * Clear messages
   */
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Logout and redirect to login page
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Navigate to products page
   */
  goToProducts(): void {
    this.router.navigate(['/products']);
  }
}
