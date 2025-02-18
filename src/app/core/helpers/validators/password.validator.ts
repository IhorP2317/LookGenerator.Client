import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.value;
    const errors: ValidationErrors = {};
    if (!password) {
      errors['required'] = true;
    }
    if (password.length < 8 || password.length > 16) {
      errors['length'] = true;
    }

    if (!/[A-Z]/.test(password)) {
      errors['uppercase'] = true;
    }

    if (!/[a-z]/.test(password)) {
      errors['lowercase'] = true;
    }

    if (!/[0-9]/.test(password)) {
      errors['digit'] = true;
    }

    if (!/[^\w\s_]+|_/.test(password)) {
      errors['specialCharacter'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}
