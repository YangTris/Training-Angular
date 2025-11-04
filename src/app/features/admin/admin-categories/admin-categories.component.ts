import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../shared/models/category.model';

@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css'],
})
export class AdminCategoriesComponent implements OnInit {
  // Data
  categories: Category[] = [];
  selectedCategory: Category | null = null;

  // UI States
  isLoading = false;
  isSaving = false;
  showCategoryModal = false;
  showDeleteModal = false;

  // Messages
  errorMessage = '';
  successMessage = '';

  // Form
  categoryForm: FormGroup;
  isEditMode = false;

  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    // Initialize form
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  /**
   * Load all categories from API
   */
  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.errorMessage = 'Failed to load categories. Please try again.';
        this.isLoading = false;
      },
    });
  }

  /**
   * Open modal for creating new category
   */
  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedCategory = null;
    this.categoryForm.reset();
    this.showCategoryModal = true;
    this.clearMessages();
  }

  /**
   * Open modal for editing existing category
   */
  openEditModal(category: Category): void {
    this.isEditMode = true;
    this.selectedCategory = category;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
    });
    this.showCategoryModal = true;
    this.clearMessages();
  }

  /**
   * Close category modal
   */
  closeCategoryModal(): void {
    this.showCategoryModal = false;
    this.selectedCategory = null;
    this.categoryForm.reset();
  }

  /**
   * Save category (create or update)
   */
  saveCategory(): void {
    if (this.categoryForm.invalid) {
      Object.keys(this.categoryForm.controls).forEach((key) => {
        this.categoryForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const categoryData = {
      name: this.categoryForm.value.name.trim(),
      description: this.categoryForm.value.description?.trim() || '',
    };

    if (this.isEditMode && this.selectedCategory) {
      // Update existing category
      this.categoryService
        .updateCategory(this.selectedCategory.id, categoryData)
        .subscribe({
          next: () => {
            this.successMessage = 'Category updated successfully!';
            this.closeCategoryModal();
            this.loadCategories();
            this.isSaving = false;
            this.clearMessagesAfterDelay();
          },
          error: (error) => {
            console.error('Error updating category:', error);
            this.errorMessage =
              error.error?.message ||
              'Failed to update category. Please try again.';
            this.isSaving = false;
          },
        });
    } else {
      // Create new category
      this.categoryService.createCategory(categoryData).subscribe({
        next: () => {
          this.successMessage = 'Category created successfully!';
          this.closeCategoryModal();
          this.loadCategories();
          this.isSaving = false;
          this.clearMessagesAfterDelay();
        },
        error: (error) => {
          console.error('Error creating category:', error);
          if (error.status === 409) {
            this.errorMessage = 'A category with this name already exists.';
          } else {
            this.errorMessage =
              error.error?.message ||
              'Failed to create category. Please try again.';
          }
          this.isSaving = false;
        },
      });
    }
  }

  /**
   * Open delete confirmation modal
   */
  openDeleteModal(category: Category): void {
    this.selectedCategory = category;
    this.showDeleteModal = true;
    this.clearMessages();
  }

  /**
   * Close delete confirmation modal
   */
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedCategory = null;
  }

  /**
   * Delete category
   */
  deleteCategory(): void {
    if (!this.selectedCategory) return;

    this.isSaving = true;
    this.errorMessage = '';

    this.categoryService.deleteCategory(this.selectedCategory.id).subscribe({
      next: () => {
        this.successMessage = 'Category deleted successfully!';
        this.closeDeleteModal();
        this.loadCategories();
        this.isSaving = false;
        this.clearMessagesAfterDelay();
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        if (error.status === 400) {
          this.errorMessage =
            'Cannot delete this category. It may be in use by products.';
        } else {
          this.errorMessage =
            error.error?.message ||
            'Failed to delete category. Please try again.';
        }
        this.closeDeleteModal();
        this.isSaving = false;
      },
    });
  }

  /**
   * Clear all messages
   */
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Clear messages after 3 seconds
   */
  private clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.clearMessages();
    }, 3000);
  }

  /**
   * Check if form field has error
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.categoryForm.get(fieldName);
    return !!(field && field.hasError(errorType) && field.touched);
  }
}
