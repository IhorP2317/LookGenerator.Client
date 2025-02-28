import { InjectionToken } from '@angular/core';
import { AuthStateModel } from './shared/store/auth/auth-state.model';
import { StateToken } from '@ngxs/store';
import { EmailConfirmationModel } from './shared/store/email-confirmation/email-confirmation.model';

export const API_URL = new InjectionToken<string>('Api URL');
export const IDENTITY_API_URL = new InjectionToken<string>('Identity Api URL');

export const AUTH_STATE_TOKEN = new StateToken<AuthStateModel>('auth');
export const EMAIL_CONFIRMATION_STATE_TOKEN =
  new StateToken<EmailConfirmationModel>('emailConfirmation');
