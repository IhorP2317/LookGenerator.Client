import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private isLoadingSignal = signal(false);
  isLoading = this.isLoadingSignal.asReadonly();

  loading$ = this.loadingSubject.asObservable();

  show(): void {
    this.loadingSubject.next(true);
  }
  hide(): void {
    this.loadingSubject.next(false);
  }
  startLoading() {
    this.isLoadingSignal.set(true);
  }
  endLoading() {
    this.isLoadingSignal.set(false);
  }
}
