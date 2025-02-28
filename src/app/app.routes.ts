import { Routes } from '@angular/router';
import { provideStates } from '@ngxs/store';
import { EmailConfirmationState } from './shared/store/email-confirmation/email-confirmation-state';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((c) => c.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(
        (c) => c.RegisterComponent,
      ),
  },
  {
    path: 'email/confirm',
    loadComponent: () =>
      import('./pages/email-confirmation/email-confirmation.component').then(
        (c) => c.EmailConfirmationComponent,
      ),
    providers: [provideStates([EmailConfirmationState])],
  },
  {
    path: 'feed',
    loadComponent: () =>
      import('./pages/feed/feed.component').then((c) => c.FeedComponent),
  },
  {
    path: '',
    redirectTo: 'feed',
    pathMatch: 'full',
  },
];
