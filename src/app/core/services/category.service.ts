import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../../shared/models';

/**
 * Category service
 * Handles category-related API operations
 */
@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = 'http://localhost:5296/api/category';

  constructor(private http: HttpClient) {}

  /**
   * Get all categories
   */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  /**
   * Get category by ID
   */
  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new category (Admin only)
   */
  createCategory(category: {
    name: string;
    description?: string;
  }): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  /**
   * Update category (Admin only)
   */
  updateCategory(
    id: string,
    category: { name: string; description?: string }
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, category);
  }

  /**
   * Delete category (Admin only)
   */
  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
