import { CanActivateFn } from '@angular/router';

export const suspensionGuard: CanActivateFn = (route, state) => {
  return true;
};
