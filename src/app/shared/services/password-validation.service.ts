import { Injectable } from '@angular/core';
import { PASSWORD_VALIDATION_ERRORS } from '../../core/constants/constants';
import { AbstractControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PasswordValidationService {
  private passwordRequirementsSubject = new BehaviorSubject(
    Object.entries(PASSWORD_VALIDATION_ERRORS).map(([_, message]) => ({
      valid: false,
      message,
    })),
  );

  passwordRequirements$ = this.passwordRequirementsSubject.asObservable();

  validate(control: AbstractControl | null): void {
    if (!control) return;
    const controlErrors = control.errors;
    const updatedRequirements = Object.entries(PASSWORD_VALIDATION_ERRORS).map(
      ([key, message]) => ({
        valid: !controlErrors?.[key],
        message,
      }),
    );
    this.passwordRequirementsSubject.next(updatedRequirements);
  }
}
