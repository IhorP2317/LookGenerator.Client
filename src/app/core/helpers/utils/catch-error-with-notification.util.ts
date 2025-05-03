import { HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

export function catchErrorWithNotification<T = unknown>(
  messageService: MessageService,
  defaultValue?: T,
): (source: Observable<T>) => Observable<T> {
  return (source: Observable<T>) =>
    source.pipe(
      catchError((error: unknown) => {
        let severity = 'error';
        let summary = 'Error';
        let detail = 'An unknown error occurred.';

        if (error instanceof HttpErrorResponse) {
          const problemDetails = error.error;

          summary = problemDetails.title || 'Error';
          detail = problemDetails.detail || 'An error occurred.';

          switch (error.status) {
            case 400:
              severity = 'warn';
              break;
            case 401:
              severity = 'error';
              break;
            case 403:
              severity = 'warn';
              break;
            case 404:
              severity = 'info';
              break;
            case 500:
              severity = 'error';
              break;
            default:
              severity = 'error';
          }
        }

        messageService.add({ severity, summary, detail });

        return defaultValue ? of(defaultValue) : EMPTY;
      }),
    );
}
