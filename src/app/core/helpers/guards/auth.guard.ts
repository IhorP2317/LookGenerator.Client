import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {Store} from '@ngxs/store';
import {AuthState} from '../../../shared/store/auth/auth-state';

export const authGuard: CanActivateFn =  (route, state) => {
  if(inject(Store).selectSnapshot(AuthState.getIsAuthenticated))
      return true;
 void inject(Router).navigate(['/login']);
  return false;
};
