import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { GuildDataService } from '../services/guild-data.service';

export const guildGuard: CanActivateFn = (route, state) => {

  if (inject(GuildDataService).currGuild.guild.guildID) {
    return true;
  } else {
    return false;
  };

};
