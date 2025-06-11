import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-floating-toolbar',
  imports: [Tooltip],
  templateUrl: './floating-toolbar.component.html',
  styleUrl: './floating-toolbar.component.css',
})
export class FloatingToolbarComponent {
  private router = inject(Router);
  showSizeGuide = input(false);
  showGenerator = input(false);
  navigateToGeneration(): void {
    void this.router.navigate(['/looks/generate']);
  }

  navigateToSizeGuide(): void {
    void this.router.navigate(['/size-guide']);
  }
}
