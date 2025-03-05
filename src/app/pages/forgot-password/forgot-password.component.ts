import { Component, inject } from '@angular/core';
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Store } from '@ngxs/store';
import { MessageService } from 'primeng/api';
import { SendForgotPasswordEmail } from '../../shared/store/auth/auth.actions';
import { tap } from 'rxjs';
import { catchErrorWithNotification } from '../../core/helpers/utils/catch-error-with-notification.util';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppAuthLayoutComponent } from '../../shared/components/app-auth-layout/app-auth-layout.component';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { ButtonDirective } from 'primeng/button';

@UntilDestroy()
@Component({
  selector: 'app-forgot-password',
  imports: [
    AppAuthLayoutComponent,
    FormsModule,
    IconField,
    InputIcon,
    InputText,
    ReactiveFormsModule,
    ButtonDirective,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: [
    './forgot-password.component.css',
    '../../../assets/styles/auth.css',
  ],
})
export class ForgotPasswordComponent {
  private store: Store = inject(Store);
  private formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private messageService: MessageService = inject(MessageService);
  forgetPasswordForm = this.formBuilder.group({
    email: this.formBuilder.control<string>('', [
      Validators.required,
      Validators.email,
    ]),
  });
  onSubmit(): void {
    if (this.forgetPasswordForm.valid) {
      this.store
        .dispatch(
          new SendForgotPasswordEmail(
            this.forgetPasswordForm.controls.email.value,
          ),
        )
        .pipe(
          tap(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Mail has been send',
              detail: 'Check out your email!',
            });
          }),
          catchErrorWithNotification<void>(this.messageService),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }
}
