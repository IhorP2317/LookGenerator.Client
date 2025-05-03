import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../tokens';
import { AttributeOption } from '../models/attribute-option/attribute-option';

@Injectable({
  providedIn: 'root',
})
export class AttributeOptionApiService {
  private http = inject(HttpClient);
  private apiUrl: string = inject(API_URL);
  getAttributeOptions() {
    return this.http.get<AttributeOption[]>(this.apiUrl + '/attribute-options');
  }
}
