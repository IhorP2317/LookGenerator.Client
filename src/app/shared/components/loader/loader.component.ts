import { Component, inject } from '@angular/core';
import { LoadingService } from '../../services/loading.service';
import { AsyncPipe } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-loader',
  imports: [AsyncPipe, ProgressSpinner],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css',
})
export class LoaderComponent {
  public loader$ = inject(LoadingService).loading$;
}
