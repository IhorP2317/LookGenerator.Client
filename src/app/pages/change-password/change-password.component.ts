import { Component, inject, OnInit } from '@angular/core';
import { PasswordValidationService } from '../../shared/services/password-validation.service';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { passwordValidator } from '../../core/helpers/validators/password.validator';
import { tap } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngxs/store';
import { ChangePassword } from '../../shared/store/auth/auth.actions';
import { AuthState } from '../../shared/store/auth/auth.state';
import { AppAuthLayoutComponent } from '../../shared/components/app-auth-layout/app-auth-layout.component';
import { AsyncPipe, NgClass } from '@angular/common';
import { ButtonDirective } from 'primeng/button';
import { Password } from 'primeng/password';

@UntilDestroy()
@Component({
  selector: 'app-change-password',
  imports: [
    AppAuthLayoutComponent,
    AsyncPipe,
    ButtonDirective,
    Password,
    ReactiveFormsModule,
    NgClass,
  ],
  templateUrl: './change-password.component.html',
  styleUrls: [
    './change-password.component.css',
    '../../../assets/styles/auth.css',
  ],
})
export class ChangePasswordComponent implements OnInit {
  private store: Store = inject(Store);
  private formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private passwordValidationService: PasswordValidationService = inject(
    PasswordValidationService,
  );
  private messageService: MessageService = inject(MessageService);
  passwordRequirements$ = this.passwordValidationService.passwordRequirements$;
  currentUser = this.store.selectSignal(AuthState.getCurrentUser);
  form = this.formBuilder.group({
    oldPassword: this.formBuilder.control<string>('', [Validators.required]),
    newPassword: this.formBuilder.control<string>('', [passwordValidator()]),
  });

  ngOnInit(): void {
    this.onPasswordValueChanges();
    console.log(this.currentUser());
  }
  onSubmit(): void {
    if (this.form.valid && !!this.currentUser()) {
      this.store
        .dispatch(
          new ChangePassword(
            this.currentUser()!.id,
            this.form.controls.oldPassword.value,
            this.form.controls.newPassword.value,
          ),
        )
        .pipe(
          tap(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Change Password Success!',
              detail: '',
            });
          }),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }

  private onPasswordValueChanges(): void {
    this.form.controls.newPassword.valueChanges
      .pipe(
        tap((_) =>
          this.passwordValidationService.validate(
            this.form.controls.newPassword,
          ),
        ),
        untilDestroyed(this),
      )
      .subscribe();
  }
}
