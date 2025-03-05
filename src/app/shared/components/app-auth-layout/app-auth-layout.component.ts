import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-auth-layout',
  imports: [Card],
  templateUrl: './app-auth-layout.component.html',
  styleUrl: './app-auth-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppAuthLayoutComponent {
  title = input('');
  subtitle = input('');
}
