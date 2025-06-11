import { HttpInterceptorFn } from '@angular/common/http';
import { LoadingService } from '../../../shared/services/loading.service';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  const isLoadingEnabled = req.headers.has('X-Loading');

  const cleanedRequest = isLoadingEnabled
    ? req.clone({ headers: req.headers.delete('X-Loading') })
    : req;

  if (isLoadingEnabled) {
    loadingService.show();
  }

  return next(cleanedRequest).pipe(
    finalize(() => {
      if (isLoadingEnabled) {
        loadingService.hide();
      }
    }),
  );
};
