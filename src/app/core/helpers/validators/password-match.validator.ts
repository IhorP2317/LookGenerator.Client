import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordsMatchValidator(
  matchTo: string,
  reverse: boolean = false,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) return null; // If there's no parent, skip validation.

    const matchControl = control.parent.get(matchTo); // Get the matching control
    if (!matchControl) return null; // If no matching control exists, skip validation.

    // Only validate if both fields have values
    if (control.value === '' || matchControl.value === '') return null;

    if (control.value !== matchControl.value) {
      if (!reverse) {
        // Apply error to this control (typically confirmPassword)
        return { passwordsMismatch: true };
      } else {
        // When validating from the password field, update validation on the matching control
        if (matchControl.value) {
          // Set error on matching control without hardcoding names
          matchControl.setErrors({
            ...(matchControl.errors || {}),
            passwordsMismatch: true,
          });
          // Ensure validation runs
          matchControl.markAsTouched();
        }
        return null;
      }
    } else if (reverse && matchControl.errors?.['passwordsMismatch']) {
      // Clear the specific error on matching control when passwords match
      const errors = { ...matchControl.errors };
      delete errors['passwordsMismatch'];
      matchControl.setErrors(Object.keys(errors).length ? errors : null);
    }

    return null;
  };
}
