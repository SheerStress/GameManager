import { Component, Renderer2, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerDataService } from '../../services/player-data.service';
import { GuildDataService } from '../../services/guild-data.service';
import { ItemDataService } from '../../services/item-data.service';
export interface GuildListing {
  guildID: number,
  guildName: string,
  welcomeMessage: string,
  memberCount: string
};

export interface GuildRequest {
  guildID: number,
  guildName: string,
  welcomeMessage: string,
  dateCreated: string
}

@Component({
  selector: 'app-guildsearch',
  templateUrl: './guildsearch.component.html',
  styleUrls: ['./guildsearch.component.css']
})
export class GuildsearchComponent implements OnInit {

  playerName: string;
  searchInput: string;
  guildListings: Array<GuildListing>;
  pendingRequest: GuildRequest;
  waiting: boolean;

  constructor(private guildData: GuildDataService, private playerData: PlayerDataService, private itemData: ItemDataService, private router: Router) {
    this.playerName = "";
    this.searchInput = "";

    this.guildListings = [];

    this.pendingRequest = {
      guildID: 0,
      guildName: "",
      welcomeMessage: "",
      dateCreated: ""
    };

    this.waiting = false;
  };

  ngOnInit() {
    console.log("guild search initialized");

    let validToken = this.playerData.verifyToken();
    console.log(validToken);

    this.playerName = this.playerData.getData().username;

    this.searchRequest();
    this.findPending();
  };

  logout() {
    this.playerData.logout();
    this.guildData.guildReset();
    this.itemData.resetCart();
    this.itemData.resetInventory();
  };

  searchRequest() {
    this.guildData.searchGuilds(this.playerData.currPlayer.playerID, this.searchInput).subscribe(response => {
      if (response.status == 200 && response.data.length >= 1) {
        this.guildListings = response.data;
      } else if (response.data.length == 0) {
        console.log("no guilds retrieved");
        this.guildListings = [];
      } else {
        console.log(response.error);
      }
    })
  }

  joinRequest(listingIndex: number) {
    this.guildData.createRequest(this.playerData.getData().playerID, this.guildListings[listingIndex].guildID)
      .subscribe(response => {
        if (response.status == 200) {
          this.waiting = true;
          console.log("successful application");
          this.findPending();
        } else {
          console.log(response.error);
        }
      })
  };

  findPending() {
    this.guildData.retrieveRequest(this.playerData.getData().playerID)
      .subscribe(response => {
        if (response.status == 200) {
          this.pendingRequest = response.data;
          this.waiting = true;
        } else {
          console.log(response.error);
        }
      })
  }

  deletePending() {
    this.guildData.withdrawRequest(this.playerData.getData().playerID, this.pendingRequest.guildID)
      .subscribe(response => {
        if (response.status == 200) {
          this.pendingRequest = {
            guildID: 0,
            guildName: "",
            welcomeMessage: "",
            dateCreated: ""
          };
          this.waiting = false;
          console.log("successful request");
        } else {
          console.log(response.error);
        }
      })
  };

}
