import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import Aura from '@primeng/themes/aura';

import { routes } from './app.routes';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';
import { provideStore } from '@ngxs/store';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeng/themes';
import { environment } from '../environments/environments';
import { API_URL, IDENTITY_API_URL } from './tokens';
import { AuthState } from './shared/store/auth/auth-state';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { MessageService } from 'primeng/api';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/helpers/interceptors/auth.interceptor';

const customPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{indigo.800}',
          inverseColor: '#ffffff',
          hoverColor: '{indigo.900}',
          activeColor: '{indigo.800}',
        },
        highlight: {
          background: '{indigo.950}',
          focusBackground: '{indigo.700}',
          color: '#ffffff',
          focusColor: '#ffffff',
        },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '{neutral.50}',
          100: '{neutral.100}',
          200: '{neutral.200}',
          300: '{neutral.300}',
          400: '{neutral.400}',
          500: '{neutral.500}',
          600: '{neutral.600}',
          700: '{neutral.700}',
          800: '{neutral.800}',
          900: '{neutral.900}',
          950: '{neutral.950}',
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore(
      [AuthState],
      withNgxsReduxDevtoolsPlugin(),
      withNgxsStoragePlugin({
        keys: ['auth.bearerToken'],
      }),
    ),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: customPreset,
        options: {
          darkMode: true,
          darkModeSelector: '.my-dark-look-generator',
          cssLayer: {
            name: 'primeng',
            order: 'tailwind-base, primeng, tailwind-utilities',
          },
        },
      },
    }),
    {
      provide: API_URL,
      useValue: environment.apiUrl,
    },
    {
      provide: IDENTITY_API_URL,
      useValue: environment.identityApiUrl,
    },
    MessageService,
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
