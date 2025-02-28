import { Component, inject, OnInit } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { ButtonDirective } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Password } from 'primeng/password';
import { PASSWORD_VALIDATION_ERRORS } from '../../core/constants/constants';
import { NgClass } from '@angular/common';
import { passwordValidator } from '../../core/helpers/validators/password.validator';
import { Store } from '@ngxs/store';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MessageService } from 'primeng/api';
import { Login } from '../../shared/store/auth/auth.actions';
import { Router, RouterLink } from '@angular/router';
import { tap } from 'rxjs';
import { AppAuthLayoutComponent } from '../../shared/components/app-auth-layout/app-auth-layout.component';
import { catchErrorWithNotification } from '../../core/helpers/utils/catch-error-with-notification.util';
import { BearerToken } from '../../core/models/bearer-token/bearer-token';
@UntilDestroy()
@Component({
  selector: 'app-login',
  imports: [
    InputText,
    ButtonDirective,
    ReactiveFormsModule,
    IconField,
    InputIcon,
    Password,
    NgClass,
    AppAuthLayoutComponent,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css', '../../../assets/styles/auth.css'],
})
export class LoginComponent implements OnInit {
  private formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private store: Store = inject(Store);
  private messageService: MessageService = inject(MessageService);
  private router: Router = inject(Router);
  loginForm = this.formBuilder.group({
    email: this.formBuilder.control<string>('', [
      Validators.required,
      Validators.email,
    ]),
    password: this.formBuilder.control<string>('', [passwordValidator()]),
  });
  passwordRequirements: Array<{ valid: boolean; message: string }> =
    Object.entries(PASSWORD_VALIDATION_ERRORS).map(([_, message]) => ({
      valid: false,
      message,
    }));

  ngOnInit(): void {
    this.onPasswordValueChanges();
  }
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.store
        .dispatch(
          new Login(
            this.loginForm.controls.email.value,
            this.loginForm.controls.password.value,
          ),
        )
        .pipe(
          tap(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Login Success',
              detail: 'You have successfully logged in!',
            });
            void this.router.navigate(['/feed']);
          }),
          catchErrorWithNotification<void>(this.messageService),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }
  private onPasswordValueChanges(): void {
    this.loginForm.controls.password.valueChanges
      .pipe(
        tap(() => {
          const controlErrors = this.loginForm.controls.password.errors;

          this.passwordRequirements = Object.entries(
            PASSWORD_VALIDATION_ERRORS,
          ).map(([key, message]) => ({
            valid: !controlErrors?.[key],
            message,
          }));
        }),
      )
      .subscribe();
  }
}
