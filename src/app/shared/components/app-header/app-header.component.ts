import { Component, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { AuthState } from '../../store/auth/auth.state';
import { RouterLink } from '@angular/router';
import { Logout } from '../../store/auth/auth.actions';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-header',
  imports: [RouterLink, Menu],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.css',
})
export class AppHeaderComponent {
  private store: Store = inject(Store);
  currentUser = this.store.selectSignal(AuthState.getCurrentUser);

  profileItems: MenuItem[] = [
    { label: 'Profile', icon: 'pi pi-id-card' },
    {
      label: 'Log Out',
      icon: 'pi pi-sign-out',
      command: () => this.onLogout(),
    },
  ];

  onLogout() {
    this.store.dispatch(new Logout());
  }
}
