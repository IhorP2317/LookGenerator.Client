import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  signup(userName: string, email: string, password: string) {
    return this.http.post<void>(this.apiUrl + '/user/register', {
      userName: userName,
      email: email,
      password: password,
    });
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(this.apiUrl + '/user/current-user');
  }
  getUser(id: string): Observable<User> {
    return this.http.get<User>(this.apiUrl + `/user/${id}`);
  }

  refreshToken(token: BearerToken): Observable<BearerToken> {
    return this.http.put<BearerToken>(
      `${this.identityUrl}/user/token/refresh`,
      {
        token: token,
      },
    );
  }

  sendEmailConfirmation(email: string) {
    return this.http.post<void>(
      this.identityUrl + '/user/email/confirm/send',
      null,
      {
        params: new HttpParams().append('email', email),
      },
    );
  }

  sendForgotPasswordEmail(email: string) {
    return this.http.post<void>(
      this.identityUrl + '/user/password/forget',
      null,
      {
        params: new HttpParams().append('email', email),
      },
    );
  }

  resetPassword(
    email: string,
    passwordResetToken: string,
    newPassword: string,
  ) {
    return this.http.patch<void>(this.identityUrl + '/user/password/reset', {
      email: email,
      passwordResetToken: passwordResetToken,
      newPassword: newPassword,
    });
  }

  changePassword(userId: string, oldPassword: string, newPassword: string) {
    return this.http.patch<void>(this.identityUrl + '/user/password/change', {
      userId: userId,
      oldPassword: oldPassword,
      newPassword: newPassword,
    });
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(this.apiUrl + `/user/${userId}`);
  }
  confirmEmail(email: string, token: string) {
    return this.http.post<void>(this.apiUrl + '/user/email/confirm', null, {
      params: new HttpParams().append('email', email).append('token', token),
    });
  }
}
