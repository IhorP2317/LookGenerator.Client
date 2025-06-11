import { Component, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { AuthState } from '../../store/auth/auth.state';
import { Router, RouterLink } from '@angular/router';
import { Logout } from '../../store/auth/auth.actions';
import { Menu } from 'primeng/menu';
import { MenuItem, MenuItemCommandEvent } from 'primeng/api';

@Component({
  selector: 'app-header',
  imports: [RouterLink, Menu],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.css',
})
export class AppHeaderComponent {
  private store: Store = inject(Store);
  private router: Router = inject(Router);
  currentUser = this.store.selectSignal(AuthState.getCurrentUser);

  profileItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-id-card',
      command: () => this.onProfileClick(),
    },
    {
      label: 'Log Out',
      icon: 'pi pi-sign-out',
      command: () => this.onLogout(),
    },
  ];

  private onProfileClick() {
    void this.router.navigate(['/users/', this.currentUser()?.id]);
  }

  private onLogout() {
    this.store.dispatch(new Logout());
  }
}
