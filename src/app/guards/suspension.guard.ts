import { CanActivateFn } from '@angular/router';

export const suspensionGuard: CanActivateFn = (route, state) => {

  //non-functional - would be used in case of player suspension to prevent all component access
  return true;
};
