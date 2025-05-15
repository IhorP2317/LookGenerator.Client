import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../tokens';
import { ProductVariationFilterPayload } from '../models/helpers/product-variation-filter-type';
import { ProductVariation } from '../models/product-variation/product-variation';

@Injectable({
  providedIn: 'root',
})
export class ProductVariationApiService {
  private http = inject(HttpClient);
  private apiUrl: string = inject(API_URL);
  getAll(filters: ProductVariationFilterPayload) {
    return this.http.post<ProductVariation[]>(
      this.apiUrl + '/product-variations',
      {
        filters: filters,
      },
    );
  }
}
