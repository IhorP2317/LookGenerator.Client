import { InjectionToken } from '@angular/core';
import { AuthStateModel } from './shared/store/auth/auth-state.model';
import { StateToken } from '@ngxs/store';
import { EmailConfirmationModel } from './shared/store/email-confirmation/email-confirmation.model';
import { FeedModel } from './shared/store/feed/feed.model';
import { LookStateModel } from './shared/store/look/look.state.model';
import { LookManagementStateModel } from './shared/store/look-management/look-management.state.model';

export const API_URL = new InjectionToken<string>('Api URL');
export const IDENTITY_API_URL = new InjectionToken<string>('Identity Api URL');

export const AUTH_STATE_TOKEN = new StateToken<AuthStateModel>('auth');
export const EMAIL_CONFIRMATION_STATE_TOKEN =
  new StateToken<EmailConfirmationModel>('emailConfirmation');
export const FEED_STATE_TOKEN = new StateToken<FeedModel>('feed');
export const LOOK_STATE_TOKEN = new StateToken<LookStateModel>('look');
export const LOOK_MANAGEMENT_STATE_TOKEN =
  new StateToken<LookManagementStateModel>('lookManagement');
