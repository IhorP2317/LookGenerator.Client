import { EMAIL_CONFIRMATION_STATE_TOKEN } from '../../../tokens';
import { EmailConfirmationModel } from './email-confirmation.model';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { UntilDestroy } from '@ngneat/until-destroy';
import { inject, Injectable } from '@angular/core';
import { UserApiService } from '../../../core/services/user.api.service';
import {
  ConfirmEmail,
  SendEmailConfirmation,
} from './email-confirmation.actions';
import { catchError, EMPTY, tap } from 'rxjs';
import { catchErrorWithNotification } from '../../../core/helpers/utils/catch-error-with-notification.util';
import { MessageService } from 'primeng/api';

@State<EmailConfirmationModel>({
  name: EMAIL_CONFIRMATION_STATE_TOKEN,
  defaults: {
    isEmailConfirmed: null,
  },
})
@UntilDestroy()
@Injectable()
export class EmailConfirmationState {
  private userApiService: UserApiService = inject(UserApiService);
  private messageService: MessageService = inject(MessageService);

  @Selector([EmailConfirmationState])
  static getIsEmailConfirmed(state: EmailConfirmationModel) {
    return state?.isEmailConfirmed;
  }
  @Action(SendEmailConfirmation)
  sendEmailConfirmation(
    ctx: StateContext<EmailConfirmationModel>,
    action: SendEmailConfirmation,
  ) {
    return this.userApiService
      .sendEmailConfirmation(action.email)
      .pipe(catchErrorWithNotification<void>(this.messageService));
  }

  @Action(ConfirmEmail)
  confirmEmail(
    ctx: StateContext<EmailConfirmationModel>,
    action: ConfirmEmail,
  ) {
    return this.userApiService.confirmEmail(action.email, action.token).pipe(
      tap(() => ctx.patchState({ isEmailConfirmed: true })),
      catchError((_) => {
        ctx.patchState({ isEmailConfirmed: false });
        return EMPTY;
      }),
    );
  }
}
