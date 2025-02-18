import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL, IDENTITY_API_URL } from '../../tokens';
import { BearerToken } from '../models/bearer-token/bearer-token';
import { User } from '../models/user/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private http: HttpClient = inject(HttpClient);
  private apiUrl: string = inject(API_URL);
  private identityUrl: string = inject(IDENTITY_API_URL);
  login(email: string, password: string) {
    return this.http.post<BearerToken>(this.identityUrl + '/user/login', {
      email: email,
      password: password,
    });
  }
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(this.apiUrl + '/user/current-user');
  }
  refreshToken(token: BearerToken): Observable<BearerToken> {

    return this.http.put<BearerToken>(this.identityUrl + '/user/token/refresh',{
      token: token,
    })
  }
}
