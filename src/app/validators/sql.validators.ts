import { AbstractControl } from '@angular/forms';
export function SqlValidator(control: AbstractControl) {

  try {

    let words = control.value.split(" ");
    if (words.length == 1 && words[0] !== "*" && words[0] !== "1" && words[0] !== "0") {
      return { sqlValid: true };
    };

  } catch (error) {

    return null;
  };

  return null;
}
