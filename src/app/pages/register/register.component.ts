import { Component, inject, OnInit } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Store } from '@ngxs/store';
import { MessageService } from 'primeng/api';
import { Router, RouterLink } from '@angular/router';
import { AppAuthLayoutComponent } from '../../shared/components/app-auth-layout/app-auth-layout.component';
import { NgClass } from '@angular/common';
import { passwordValidator } from '../../core/helpers/validators/password.validator';
import { passwordsMatchValidator } from '../../core/helpers/validators/password-match.validator';
import { PASSWORD_VALIDATION_ERRORS } from '../../core/constants/constants';
import { tap } from 'rxjs';
import { Signup } from '../../shared/store/auth/auth.actions';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { catchErrorWithNotification } from '../../core/helpers/utils/catch-error-with-notification.util';
@UntilDestroy()
@Component({
  selector: 'app-register',
  imports: [
    ButtonDirective,
    IconField,
    InputIcon,
    InputText,
    Password,
    ReactiveFormsModule,
    AppAuthLayoutComponent,
    NgClass,
    RouterLink,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css', '../../../assets/styles/auth.css'],
})
export class RegisterComponent implements OnInit {
  private formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private store: Store = inject(Store);
  private messageService: MessageService = inject(MessageService);
  private router: Router = inject(Router);
  passwordRequirements: Array<{ valid: boolean; message: string }> =
    Object.entries(PASSWORD_VALIDATION_ERRORS).map(([_, message]) => ({
      valid: false,
      message,
    }));
  registerForm = this.formBuilder.group({
    username: ['', Validators.required],
    email: this.formBuilder.control<string>('', [
      Validators.required,
      Validators.email,
    ]),
    password: this.formBuilder.control<string>('', [
      passwordValidator(),
      passwordsMatchValidator('confirmPassword', true),
    ]),
    confirmPassword: this.formBuilder.control<string>('', [
      Validators.required,
      passwordsMatchValidator('password'),
    ]),
  });
  ngOnInit(): void {
    this.onPasswordValueChanges();
  }
  private onPasswordValueChanges(): void {
    this.registerForm.controls.password.valueChanges
      .pipe(
        tap(() => {
          const controlErrors = this.registerForm.controls.password.errors;

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
  onSubmit(): void {
    if (this.registerForm.valid) {
      this.store
        .dispatch(
          new Signup(
            this.registerForm.controls.username.value,
            this.registerForm.controls.email.value,
            this.registerForm.controls.password.value,
          ),
        )
        .pipe(
          tap(() => {
            this.messageService.add({
              severity: 'warning',
              summary: 'Please confirm your email before login!',
              detail: 'We send a letter on your email address',
            });
            void this.router.navigate(['/login']);
          }),
          catchErrorWithNotification<void>(this.messageService),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }
}
