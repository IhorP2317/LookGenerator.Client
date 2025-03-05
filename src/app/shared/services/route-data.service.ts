import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, tap } from 'rxjs';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RouteDataService {
  private showHeaderSubject = new BehaviorSubject<boolean>(false);
  showHeader$ = this.showHeaderSubject.asObservable();

  private router: Router = inject(Router);

  constructor() {
    this.monitorRouteChanges();
  }

  private monitorRouteChanges() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          const snapshot = this.router.routerState.root.snapshot;
          const child = this.findDeepestChild(snapshot);
          return child.data?.['showHeader'] ?? false;
        }),
        tap((showHeader) => {
          if (showHeader !== this.showHeaderSubject.value) {
            this.showHeaderSubject.next(showHeader);
          }
        }),
      )
      .subscribe();
  }

  private findDeepestChild(
    route: ActivatedRouteSnapshot,
  ): ActivatedRouteSnapshot {
    let child = route;
    while (child.firstChild) {
      child = child.firstChild;
    }
    return child;
  }
}
