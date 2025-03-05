import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Store } from '@ngxs/store';
import { MessageService } from 'primeng/api';
import { passwordValidator } from '../../core/helpers/validators/password.validator';
import { passwordsMatchValidator } from '../../core/helpers/validators/password-match.validator';
import { filter, map, take, tap } from 'rxjs';
import { ResetPassword } from '../../shared/store/auth/auth.actions';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { catchErrorWithNotification } from '../../core/helpers/utils/catch-error-with-notification.util';
import { PasswordValidationService } from '../../shared/services/password-validation.service';
import { AppAuthLayoutComponent } from '../../shared/components/app-auth-layout/app-auth-layout.component';
import { ButtonDirective } from 'primeng/button';
import { Password } from 'primeng/password';
import { AsyncPipe, NgClass } from '@angular/common';

@UntilDestroy()
@Component({
  selector: 'app-reset-password',
  imports: [
    AppAuthLayoutComponent,
    ButtonDirective,
    FormsModule,
    Password,
    ReactiveFormsModule,
    AsyncPipe,
    NgClass,
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: [
    './reset-password.component.css',
    '../../../assets/styles/auth.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent implements OnInit {
  private store: Store = inject(Store);
  private formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private messageService: MessageService = inject(MessageService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private passwordValidationService: PasswordValidationService = inject(
    PasswordValidationService,
  );
  passwordRequirements$ = this.passwordValidationService.passwordRequirements$;
  form = this.formBuilder.group({
    password: this.formBuilder.control<string>('', [
      passwordValidator(),
      passwordsMatchValidator('confirmPassword', true),
    ]),
    confirmPassword: this.formBuilder.control<string>('', [
      Validators.required,
      passwordsMatchValidator('password'),
    ]),
  });
  email = signal<string | null>(null);
  token = signal<string | null>(null);
  isButtonDisabled: Signal<boolean> = computed(
    () => !this.email() || !this.token(),
  );

  ngOnInit(): void {
    this.fetchResetPasswordParams();
    this.onPasswordValueChanges();
  }

  onSubmit(): void {
    if (!this.isButtonDisabled() || this.form.valid) {
      this.store
        .dispatch(
          new ResetPassword(
            this.email()!,
            this.token()!,
            this.form.controls.password.value,
          ),
        )
        .pipe(
          tap(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Reset Password Success!',
              detail: 'Now you can login again!',
            });
          }),
          catchErrorWithNotification<void>(this.messageService),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }

  private onPasswordValueChanges(): void {
    this.form.controls.password.valueChanges
      .pipe(
        tap((_) =>
          this.passwordValidationService.validate(this.form.controls.password),
        ),
        untilDestroyed(this),
      )
      .subscribe();
  }

  private fetchResetPasswordParams() {
    this.route.queryParams
      .pipe(
        map((params) => ({
          email: params['email'] as string,
          token: params['token'] as string,
        })),
        filter((params) => !!params.email && !!params.token),
        take(1),
        tap((params) => {
          this.email.set(params.email);
          this.token.set(params.token);
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }
}
