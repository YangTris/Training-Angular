import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from 'src/app/core/services/product.service';
import { CategoryService } from 'src/app/core/services/category.service';
import {
  ProductDetail,
  Category,
  CreateProductRequest,
  UpdateProductRequest,
  PaginatedResult,
} from 'src/app/shared/models';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css'],
})
export class AdminProductsComponent implements OnInit {
  products: ProductDetail[] = [];
  categories: Category[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalItems = 0;

  // Modals
  showProductModal = false;
  showDeleteProductModal = false;
  selectedProduct: ProductDetail | null = null;
  productForm: FormGroup;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0.01)]],
      categoryId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories = categories;
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
      },
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService
      .getProducts({
        pageNumber: this.currentPage,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (result) => {
          const productPromises = result.items.map((product) =>
            this.productService.getProductById(product.id).toPromise()
          );

          Promise.all(productPromises)
            .then((detailedProducts) => {
              this.products = detailedProducts.filter(
                (p): p is ProductDetail => p !== undefined
              );
              this.totalPages = result.totalPages;
              this.totalItems = result.totalItems;
              this.isLoading = false;
            })
            .catch((error) => {
              console.error('Error loading product details:', error);
              this.errorMessage = 'Failed to load product details.';
              this.isLoading = false;
            });
        },
        error: (error: any) => {
          console.error('Error loading products:', error);
          this.errorMessage = 'Failed to load products.';
          this.isLoading = false;
        },
      });
  }

  openProductModal(product?: ProductDetail): void {
    this.selectedProduct = product || null;
    this.clearMessages();

    if (product) {
      this.productForm.patchValue({
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
      });
    } else {
      this.productForm.reset({ price: 0 });
    }

    this.showProductModal = true;
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.selectedProduct = null;
    this.productForm.reset();
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formData = this.productForm.value;

    if (this.selectedProduct) {
      // Update existing product
      const updateRequest: UpdateProductRequest = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
      };

      this.productService
        .updateProduct(this.selectedProduct.id, updateRequest)
        .subscribe({
          next: () => {
            this.successMessage = 'Product updated successfully!';
            this.closeProductModal();
            this.loadProducts();
            this.isLoading = false;
            setTimeout(() => (this.successMessage = ''), 3000);
          },
          error: (error: any) => {
            this.errorMessage =
              error.error?.message || 'Failed to update product.';
            this.isLoading = false;
          },
        });
    } else {
      // Create new product
      const createRequest: CreateProductRequest = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        categoryId: formData.categoryId,
      };

      this.productService.createProduct(createRequest).subscribe({
        next: () => {
          this.successMessage = 'Product created successfully!';
          this.closeProductModal();
          this.loadProducts();
          this.isLoading = false;
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (error: any) => {
          this.errorMessage =
            error.error?.message || 'Failed to create product.';
          this.isLoading = false;
        },
      });
    }
  }

  openDeleteProductModal(product: ProductDetail): void {
    this.selectedProduct = product;
    this.showDeleteProductModal = true;
    this.clearMessages();
  }

  closeDeleteProductModal(): void {
    this.showDeleteProductModal = false;
    this.selectedProduct = null;
  }

  deleteProduct(): void {
    if (!this.selectedProduct) return;

    this.isLoading = true;

    this.productService.deleteProduct(this.selectedProduct.id).subscribe({
      next: () => {
        this.successMessage = 'Product deleted successfully!';
        this.closeDeleteProductModal();

        // Adjust current page if needed
        if (this.products.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }

        this.loadProducts();
        this.isLoading = false;
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (error: any) => {
        this.errorMessage = error.error?.message || 'Failed to delete product.';
        this.isLoading = false;
      },
    });
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
