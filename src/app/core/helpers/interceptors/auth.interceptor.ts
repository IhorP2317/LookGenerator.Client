import {
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { catchError, from, map, mergeMap, of, throwError } from 'rxjs';
import { Store } from '@ngxs/store';
import {inject} from '@angular/core';
import {AuthState} from '../../../shared/store/auth/auth-state';
import {RefreshToken} from '../../../shared/store/auth/auth.actions';
import {BearerToken} from '../../models/bearer-token/bearer-token';




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
      Authorization: `Bearer ${token.accessToken}`
    }
  });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  const token = store.selectSnapshot(AuthState.getBearerToken);

  return of(req).pipe(
    map(originalReq =>
      isAuthEndpoint(originalReq) ? originalReq : attachAccessToken(originalReq, token)
    ),
    mergeMap(updatedReq => next(updatedReq)),
    catchError(error => {
      if (error.status === 401 && token?.refreshToken) {
        return from(store.dispatch(new RefreshToken(token))).pipe(
          mergeMap(() => {
            const newToken = store.selectSnapshot(AuthState.getBearerToken);
             return !newToken ?
               throwError(() => error) : next(attachAccessToken(req, newToken));
          }),
          catchError(refreshErr => throwError(() => refreshErr))
        );
      }
      return throwError(() => error);
    })
  );
};
