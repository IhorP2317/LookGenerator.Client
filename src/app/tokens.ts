import { InjectionToken } from '@angular/core';
import { AuthStateModel } from './shared/store/auth/auth-state.model';
import { StateToken } from '@ngxs/store';

export const API_URL = new InjectionToken<string>('Api URL');
export const IDENTITY_API_URL = new InjectionToken<string>('Identity Api URL');

export const AUTH_STATE_TOKEN = new StateToken<AuthStateModel>('auth');
