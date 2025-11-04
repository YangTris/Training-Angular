import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Product,
  ProductDetail,
  PaginatedResult,
  PaginationParams,
  CreateProductRequest,
  UpdateProductRequest,
} from '../../shared/models';

/**
 * Product service
 * Handles all product-related API operations
 */
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:5296/api/product';

  constructor(private http: HttpClient) {}

  /**
   * Get paginated list of products
   */
  getProducts(params?: PaginationParams): Observable<PaginatedResult<Product>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.pageNumber)
        httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize)
        httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm)
        httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.isDescending !== undefined)
        httpParams = httpParams.set(
          'isDescending',
          params.isDescending.toString()
        );
    }

    return this.http.get<PaginatedResult<Product>>(this.apiUrl, {
      params: httpParams,
    });
  }

  getProductById(id: string): Observable<ProductDetail> {
    return this.http.get<ProductDetail>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: CreateProductRequest): Observable<ProductDetail> {
    return this.http.post<ProductDetail>(this.apiUrl, product);
  }

  /**
   * Create product with images (multipart/form-data)
   */
  createProductWithImages(formData: FormData): Observable<ProductDetail> {
    return this.http.post<ProductDetail>(this.apiUrl, formData);
  }

  updateProduct(
    id: string,
    updateProduct: UpdateProductRequest
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, updateProduct);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
