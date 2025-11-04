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

  // Image upload
  selectedImages: File[] = [];
  imagePreviewUrls: string[] = [];
  mainImageIndex: number = 0;

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
    this.selectedImages = [];
    this.imagePreviewUrls = [];
    this.mainImageIndex = 0;

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
    this.selectedImages = [];
    this.imagePreviewUrls = [];
    this.mainImageIndex = 0;
  }

  /**
   * Handle image file selection
   */
  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.selectedImages = Array.from(input.files);
    this.imagePreviewUrls = [];

    // Validate images
    const validImages: File[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    for (const file of this.selectedImages) {
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = `Invalid file type: ${file.name}. Allowed: JPG, PNG, GIF, WEBP`;
        continue;
      }
      if (file.size > maxSize) {
        this.errorMessage = `File too large: ${file.name}. Max size: 5MB`;
        continue;
      }
      validImages.push(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviewUrls.push(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    this.selectedImages = validImages;

    if (validImages.length === 0) {
      input.value = '';
    }
  }

  /**
   * Remove selected image
   */
  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.imagePreviewUrls.splice(index, 1);

    // Adjust main image index if needed
    if (this.mainImageIndex >= this.selectedImages.length) {
      this.mainImageIndex = Math.max(0, this.selectedImages.length - 1);
    }
  }

  /**
   * Set main image
   */
  setMainImage(index: number): void {
    this.mainImageIndex = index;
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      return;
    }

    // Validate images for new products
    if (!this.selectedProduct && this.selectedImages.length === 0) {
      this.errorMessage = 'At least one product image is required';
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
      // Create new product with images using FormData
      const formDataPayload = new FormData();
      formDataPayload.append('name', formData.name);
      formDataPayload.append('description', formData.description || '');
      formDataPayload.append('price', formData.price.toString());
      formDataPayload.append('categoryId', formData.categoryId);
      formDataPayload.append('mainImageIndex', this.mainImageIndex.toString());

      // Add all image files
      this.selectedImages.forEach((file) => {
        formDataPayload.append('images', file);
      });

      this.productService.createProductWithImages(formDataPayload).subscribe({
        next: () => {
          this.successMessage = 'Product created successfully!';
          this.closeProductModal();
          this.loadProducts();
          this.isLoading = false;
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (error: any) => {
          console.error('Error creating product:', error);
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
