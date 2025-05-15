import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../tokens';
import { ProductCategoryFilterPayload } from '../models/helpers/product-category-filter-type';
import { ProductCategory } from '../models/product-category/product-category';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductCategoryApiService {
  private http = inject(HttpClient);
  private apiUrl: string = inject(API_URL);

  getAll(filters: ProductCategoryFilterPayload): Observable<ProductCategory[]> {
    return this.http.post<ProductCategory[]>(
      this.apiUrl + '/product-categories',
      {
        filters: filters,
      },
    );
  }
}
