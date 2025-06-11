import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { GetLookToManage } from '../../../shared/store/look-management/look-management.actions';
import { LookManagementState } from '../../../shared/store/look-management/look-management.state';
import { combineLatest, filter, map, of, switchMap, take } from 'rxjs';
import { Look } from '../../models/look/look';
import { AuthState } from '../../../shared/store/auth/auth.state';
import { catchError } from 'rxjs/operators';
import { User } from '../../models/user/user';
import { Location } from '@angular/common';

export const lookOwnershipGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  const location = inject(Location); // from @angular/common

  const id = route.paramMap.get('id');

  return combineLatest([
    store.dispatch(new GetLookToManage(id!)).pipe(
      switchMap(() => store.select(LookManagementState.getLook)),
      filter((look): look is Look => !!look),
      take(1),
    ),
    store.select(AuthState.getCurrentUser).pipe(
      filter((user): user is User => !!user),
      take(1),
    ),
  ]).pipe(
    map(([look, currentUser]) => {
      const isOwner =
        look.creator?.id === currentUser.id || currentUser.role === 'Admin';

      if (!isOwner) {
        location.back();
      }

      return isOwner;
    }),
    catchError(() => {
      void router.navigate(['/feed']);
      return of(false);
    }),
  );
};
