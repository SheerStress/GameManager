import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { PlayerDataService } from "../services/player-data.service";


export const authGuard: CanActivateFn = (route, state) => {

  //check player log in state (if player successfully validated from log in)
  return inject(PlayerDataService).loggedIn;
};
