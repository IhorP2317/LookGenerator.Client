import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { catchError, finalize, from, mergeMap, throwError } from 'rxjs';
import { Store } from '@ngxs/store';
import { inject } from '@angular/core';
import { AuthState } from '../../../shared/store/auth/auth.state';
import { Logout, RefreshToken } from '../../../shared/store/auth/auth.actions';
import { BearerToken } from '../../models/bearer-token/bearer-token';
import { LoadingService } from '../../../shared/services/loading.service';

function isAuthEndpoint(req: HttpRequest<unknown>): boolean {
  return req.url.endsWith('/login') || req.url.endsWith('/refresh');
}

function attachAccessToken(
  req: HttpRequest<unknown>,
  token: BearerToken | null,
): HttpRequest<unknown> {
  if (!token) return req;
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token.accessToken}`,
    },
  });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  const loadingService = inject(LoadingService);
  const token = store.selectSnapshot(AuthState.getBearerToken);
  loadingService.show();
  const modifiedReq = isAuthEndpoint(req) ? req : attachAccessToken(req, token);

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token?.refreshToken) {
        console.warn('Access token expired, attempting refresh...');

        return from(store.dispatch(new RefreshToken(token))).pipe(
          mergeMap(() => {
            const newToken = store.selectSnapshot(AuthState.getBearerToken);
            return newToken
              ? next(attachAccessToken(req, newToken))
              : throwError(() => error);
          }),
          catchError((refreshError) => {
            console.error('Token refresh failed. Logging out...');
            store.dispatch(new Logout());
            return throwError(() => refreshError);
          }),
        );
      }

      return throwError(() => error);
    }),
    finalize(() => loadingService.hide()),
  );
};
