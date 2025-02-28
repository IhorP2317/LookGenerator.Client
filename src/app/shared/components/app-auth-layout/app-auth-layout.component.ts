import { Component, Input } from '@angular/core';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-auth-layout',
  imports: [Card],
  templateUrl: './app-auth-layout.component.html',
  styleUrl: './app-auth-layout.component.css',
})
export class AppAuthLayoutComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
}
