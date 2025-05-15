import { Routes } from '@angular/router';
import { provideStates } from '@ngxs/store';
import { EmailConfirmationState } from './shared/store/email-confirmation/email-confirmation.state';
import { guestGuard } from './core/helpers/guards/guest.guard';
import { authGuard } from './core/helpers/guards/auth.guard';
import { FeedState } from './shared/store/feed/feed.state';
import { LookState } from './shared/store/look/look.state';
import { LookManagementState } from './shared/store/look-management/look-management.state';
import { lookOwnershipGuard } from './core/helpers/guards/look-ownership.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((c) => c.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(
        (c) => c.RegisterComponent,
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'email/confirm',
    loadComponent: () =>
      import('./pages/email-confirmation/email-confirmation.component').then(
        (c) => c.EmailConfirmationComponent,
      ),
    providers: [provideStates([EmailConfirmationState])],
    data: { showHeader: true },
  },
  {
    path: 'password/forgot',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then(
        (c) => c.ForgotPasswordComponent,
      ),
  },
  {
    path: 'password/reset',
    loadComponent: () =>
      import('./pages/reset-password/reset-password.component').then(
        (c) => c.ResetPasswordComponent,
      ),
  },
  {
    path: 'password/change',
    loadComponent: () =>
      import('./pages/change-password/change-password.component').then(
        (c) => c.ChangePasswordComponent,
      ),
    data: { showHeader: true },
    canActivate: [authGuard],
  },
  {
    path: 'feed',
    loadComponent: () =>
      import('./pages/feed/feed.component').then((c) => c.FeedComponent),
    providers: [provideStates([FeedState])],
    data: { showHeader: true },
  },
  {
    path: 'looks/management',
    loadComponent: () =>
      import('./pages/look-management/look-management.component').then(
        (c) => c.LookManagementComponent,
      ),
    data: { showHeader: true },
    providers: [provideStates([LookManagementState])],
    canActivate: [authGuard],
  },
  {
    path: 'looks/management/:id',
    loadComponent: () =>
      import('./pages/look-management/look-management.component').then(
        (c) => c.LookManagementComponent,
      ),
    data: { showHeader: true },
    providers: [provideStates([LookManagementState])],
    canActivate: [authGuard, lookOwnershipGuard],
  },
  {
    path: 'looks/:id',
    loadComponent: () =>
      import('./pages/look/look.component').then((c) => c.LookComponent),
    data: { showHeader: true },
    providers: [provideStates([LookState])],
  },
  {
    path: 'looks/generate',
    loadComponent: () =>
      import('./pages/look-generation/look-generation.component').then(
        (c) => c.LookGenerationComponent,
      ),
    data: { showHeader: true },
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'feed',
    pathMatch: 'full',
  },
];
