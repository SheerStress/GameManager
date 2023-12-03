import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { PlayerDataService } from "../services/player-data.service";


export const authGuard: CanActivateFn = (route, state) => {

  return inject(PlayerDataService).loggedIn;
};
