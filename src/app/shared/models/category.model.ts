/**
 * Category related models
 */

import { Product } from "./product.model";

export interface Category {
  id: string;
  name: string;
  description: string;
  
}

export interface CategoryDetail extends Category {
  createdAt: string;
  isDeleted: boolean;
  products?: Product[];
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description: string;
}
