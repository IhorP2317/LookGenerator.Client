import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '../../tokens';
import { SizeGuideFilterPayload } from '../models/helpers/size-guide-filter-type';
import { SizeGuideTable } from '../models/size-guide/size-guide-table';

@Injectable({
  providedIn: 'root',
})
export class SizeGuideApiService {
  private http = inject(HttpClient);
  private apiUrl: string = inject(API_URL);
  getSizeGuide(filters: SizeGuideFilterPayload) {
    return this.http.post<SizeGuideTable>(this.apiUrl + '/size-guide', {
      filters: filters,
    });
  }
}
