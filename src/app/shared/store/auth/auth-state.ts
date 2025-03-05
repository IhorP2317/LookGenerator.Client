import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { AuthStateModel } from './auth-state.model';
import { AUTH_STATE_TOKEN } from '../../../tokens';
import { inject, Injectable } from '@angular/core';
import { UserApiService } from '../../../core/services/user.api.service';
import { Observable, of, switchMap, take, tap } from 'rxjs';
import { BearerToken } from '../../../core/models/bearer-token/bearer-token';
import { User } from '../../../core/models/user/user';
import { patch } from '@ngxs/store/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  ChangePassword,
  DeleteUser,
  Login,
  Logout,
  RefreshToken,
  ResetPassword,
  SendForgotPasswordEmail,
  Signup,
} from './auth.actions';
import { catchErrorWithNotification } from '../../../core/helpers/utils/catch-error-with-notification.util';
import { MessageService } from 'primeng/api';

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
  private messageService: MessageService = inject(MessageService);

  ngxsOnInit(ctx: StateContext<AuthStateModel>): void {
    this.loadCurrentUser(ctx).pipe(untilDestroyed(this)).subscribe();
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
  login(ctx: StateContext<AuthStateModel>, action: Login) {
    return this.userApiService.login(action.email, action.password).pipe(
      take(1),
      tap((token: BearerToken) => {
        this.setTokensPair(ctx, token);
      }),
      switchMap((_) => this.loadCurrentUser(ctx)),
    );
  }

  @Action(Signup)
  signup(ctx: StateContext<AuthStateModel>, action: Signup): Observable<void> {
    return this.userApiService.signup(
      action.userName,
      action.email,
      action.password,
    );
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
      .subscribe();
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>): void {
    this.setCurrentUser(ctx, null);
    this.setTokensPair(ctx, null);
  }

  @Action(SendForgotPasswordEmail)
  sendForgotPasswordEmail(
    ctx: StateContext<AuthStateModel>,
    action: SendForgotPasswordEmail,
  ) {
    return this.userApiService
      .sendForgotPasswordEmail(action.email)
      .pipe(catchErrorWithNotification<void>(this.messageService));
  }

  @Action(ResetPassword)
  resetPassword(ctx: StateContext<AuthStateModel>, action: ResetPassword) {
    return this.userApiService.resetPassword(
      action.email,
      action.passwordResetToken,
      action.newPassword,
    );
  }
  @Action(ChangePassword)
  changePassword(ctx: StateContext<AuthStateModel>, action: ChangePassword) {
    return this.userApiService.changePassword(
      action.userId,
      action.oldPassword,
      action.newPassword,
    );
  }

  @Action(DeleteUser)
  deleteUser(ctx: StateContext<AuthStateModel>, action: DeleteUser) {
    return this.userApiService.deleteUser(action.userId).pipe(
      tap(() => {
        if (action.userId === ctx.getState().currentUser?.id) {
          ctx.dispatch(new Logout());
        }
      }),
    );
  }

  private loadCurrentUser(
    ctx: StateContext<AuthStateModel>,
  ): Observable<User | null> {
    const token = ctx.getState().bearerToken;
    if (!token) {
      return of(null);
    }

    return this.userApiService.getCurrentUser().pipe(
      tap((user: User) => this.setCurrentUser(ctx, user)),
      catchErrorWithNotification<User | null>(this.messageService, null),
    );
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
