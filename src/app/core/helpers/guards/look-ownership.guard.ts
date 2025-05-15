import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { GetLookToManage } from '../../../shared/store/look-management/look-management.actions';
import { LookManagementState } from '../../../shared/store/look-management/look-management.state';
import { filter, map, switchMap, take } from 'rxjs';
import { Look } from '../../models/look/look';
import { AuthState } from '../../../shared/store/auth/auth.state';

export const lookOwnershipGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const currentUser = inject(Store).selectSnapshot(AuthState.getCurrentUser);
  const id = route.paramMap.get('id');
  return store.dispatch(new GetLookToManage(id!)).pipe(
    switchMap(() => store.select(LookManagementState.getLook)),
    filter((look): look is Look => !!look),
    map((look) => {
      return (
        !!currentUser &&
        (look.creator?.id === currentUser.id || currentUser.role === 'Admin')
      );
    }),
    take(1),
  );
};
