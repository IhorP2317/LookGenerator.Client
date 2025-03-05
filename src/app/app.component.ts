import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { AppHeaderComponent } from './shared/components/app-header/app-header.component';
import { RouteDataService } from './shared/services/route-data.service';
import { Observable } from 'rxjs';
import { AsyncPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Toast,
    LoaderComponent,
    AppHeaderComponent,
    AsyncPipe,
    NgClass,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  showHeader$: Observable<boolean> = inject(RouteDataService).showHeader$;
  title = 'look-generator-client';
}
