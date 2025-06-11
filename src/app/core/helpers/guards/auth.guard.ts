import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { AuthState } from '../../../shared/store/auth/auth.state';
import { combineLatest, filter, from, map, of, switchMap, take } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return combineLatest([
    store.select(AuthState.getIsAuthenticated),
    store.select(AuthState.getIsInitialized),
  ]).pipe(
    filter(([_, isInitialized]) => isInitialized), // ⏳ wait until ready
    take(1),
    switchMap(([isAuth]) =>
      isAuth
        ? of(true)
        : from(router.navigate(['/login'])).pipe(map(() => false)),
    ),
  );
};
