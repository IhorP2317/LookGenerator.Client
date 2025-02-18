import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { AuthStateModel } from './auth-state.model';
import { AUTH_STATE_TOKEN } from '../../../tokens';
import { inject, Injectable } from '@angular/core';
import { UserApiService } from '../../../core/services/user.api.service';
import { Observable, switchMap, take, tap } from 'rxjs';
import { BearerToken } from '../../../core/models/bearer-token/bearer-token';
import { User } from '../../../core/models/user/user';
import { patch, removeItem } from '@ngxs/store/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Login, Logout, RefreshToken } from './auth.actions';

@State<AuthStateModel>({
  name: AUTH_STATE_TOKEN,
  defaults: {
    currentUser: null,
    bearerToken: null,
  },
})
@UntilDestroy()
@Injectable()
export class AuthState implements NgxsOnInit {
  private userApiService: UserApiService = inject(UserApiService);
  ngxsOnInit(ctx: StateContext<AuthStateModel>): void {
    this.reloadCurrentUser(ctx);
  }

  @Selector([AuthState])
  static getCurrentUser(state: AuthStateModel) {
    return state.currentUser;
  }
  @Selector([AuthState])
  static getBearerToken(state: AuthStateModel) {
    return state.bearerToken;
  }
  @Selector()
  static getIsAuthenticated(state: AuthStateModel): boolean {
    return !!state.bearerToken && !!state.currentUser;
  }
  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, action: Login): void {
    this.userApiService
      .login(action.email, action.password)
      .pipe(
        take(1),
        tap((token: BearerToken) => this.setTokensPair(ctx, token)),
        switchMap((_) => this.userApiService.getCurrentUser()),
        tap((user: User) => this.setCurrentUser(ctx, user)),
        untilDestroyed(this),
      )
      .subscribe();
  }
  @Action(RefreshToken)
  refreshToken(ctx: StateContext<AuthStateModel>, action: RefreshToken): void {
    this.userApiService
      .refreshToken(action.token)
      .pipe(
        tap((token: BearerToken) => {
          this.setTokensPair(ctx, token);
        }),
        untilDestroyed(this),
      )
      .subscribe({
        next: (_) => {},
        error: (err) => {
          console.error(err);
        },
      });
  }
  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>): void {
    this.setCurrentUser(ctx, null);
    this.setTokensPair(ctx, null);
  }

  private reloadCurrentUser(ctx: StateContext<AuthStateModel>) {
    const token = ctx.getState().bearerToken;
    if (token) {
      this.userApiService
        .getCurrentUser()
        .pipe(
          tap((user: User) => this.setCurrentUser(ctx, user)),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }
  private setCurrentUser(
    ctx: StateContext<AuthStateModel>,
    user: User | null,
  ): void {
    ctx.setState(
      patch({
        currentUser: user,
      }),
    );
  }
  private setTokensPair(
    ctx: StateContext<AuthStateModel>,
    tokens: BearerToken | null,
  ): void {
    ctx.setState(
      patch({
        bearerToken: tokens,
      }),
    );
  }
}
