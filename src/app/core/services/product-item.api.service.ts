import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../tokens';
import { ProductFilterPayload } from '../models/helpers/product-filter-type';
import { PagedList } from '../models/helpers/paged-list';
import { ProductToSelect } from '../models/product/product-to-select';

@Injectable({
  providedIn: 'root',
})
export class ProductItemApiService {
  private http = inject(HttpClient);
  private apiUrl: string = inject(API_URL);

  getAllToSelect(filters: ProductFilterPayload) {
    return this.http.post<PagedList<ProductToSelect>>(
      this.apiUrl + '/product-items',
      {
        filters: filters,
      },
    );
  }
}
