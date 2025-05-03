import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../tokens';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ColourApiService {
  private http = inject(HttpClient);
  private apiUrl: string = inject(API_URL);

  getColours(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl + '/colours');
  }
}
