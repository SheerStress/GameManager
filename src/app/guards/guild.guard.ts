import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { GuildDataService } from '../services/guild-data.service';

export const guildGuard: CanActivateFn = (route, state) => {

  //only allow navigation to guild component if current user is part of a guild (has guild id)
  if (inject(GuildDataService).currGuild.guild.guildID) {
    return true;
  } else {
    return false;
  };

};
