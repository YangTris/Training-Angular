import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from 'src/app/core/services/product.service';
import { CartService } from 'src/app/core/services/cart.service';
import { AuthStore } from 'src/app/store/auth.store';
import { ProductDetail } from 'src/app/shared/models/product.model';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit {
  product: ProductDetail | null = null;
  selectedImage: string = '';
  isLoading = false;
  errorMessage = '';
  quantity = 1;
  isAddingToCart = false;
  successMessage = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authStore: AuthStore,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get product ID from route parameter
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProductDetails(id);
    } else {
      this.errorMessage = 'Product ID not found';
    }
  }

  loadProductDetails(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProductById(id).subscribe({
      next: (result: ProductDetail) => {
        this.product = result;
        // Set the main image or first image as selected
        this.selectedImage = this.getMainImage();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading product details:', error);
        this.errorMessage = 'Failed to load product details. Please try again.';
        this.isLoading = false;
      },
    });
  }

  /**
   * Get the main image URL or fallback to first image
   */
  getMainImage(): string {
    if (!this.product?.images || this.product.images.length === 0) {
      return (
        this.product?.mainImageUrl ||
        'https://vyghvmdysxqvocgvytoe.supabase.co/storage/v1/object/public/Training_img/default_img.jpg'
      );
    }

    // Find main image
    const mainImage = this.product.images.find((img) => img.isMain);
    if (mainImage) {
      return mainImage.imageUrl;
    }

    // Fallback to first image
    return this.product.images[0].imageUrl;
  }

  /**
   * Change the selected image when user clicks on thumbnail
   */
  selectImage(imageUrl: string): void {
    this.selectedImage = imageUrl;
  }

  /**
   * Navigate back to product list
   */
  goBack(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Increase quantity
   */
  increaseQuantity(): void {
    if (this.quantity < 99) {
      this.quantity++;
    }
  }

  /**
   * Decrease quantity
   */
  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  /**
   * Add product to cart
   */
  addToCart(): void {
    if (!this.product) return;

    // Check if user is logged in
    const auth = this.authStore.getAuthValue();
    if (!auth.isAuthenticated) {
      alert('Please login to add items to cart');
      this.router.navigate(['/login']);
      return;
    }

    this.isAddingToCart = true;
    this.successMessage = '';

    this.cartService
      .addToCart({
        productId: this.product.id,
        quantity: this.quantity,
      })
      .subscribe({
        next: () => {
          this.isAddingToCart = false;
          this.successMessage = `${this.product!.name} added to cart!`;

          // Reset quantity
          this.quantity = 1;

          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (err) => {
          this.isAddingToCart = false;

          if (err.status === 401) {
            alert('Session expired. Please login again.');
            this.router.navigate(['/login']);
          } else {
            alert('Failed to add item to cart. Please try again.');
          }

          console.error('Error adding to cart:', err);
        },
      });
  }
}
