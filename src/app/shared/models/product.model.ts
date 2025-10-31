/**
 * Product related models
 */

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  mainImageUrl?: string;
}

export interface ProductDetail extends Product {
  createdAt?: string;
  updatedAt?: string;
  categoryId?: string;
  images: ProductImage[];
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  isMain: boolean;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
  price: number;
}
