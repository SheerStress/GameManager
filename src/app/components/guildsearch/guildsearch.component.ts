import { Component, Renderer2, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerDataService } from '../../services/player-data.service';
import { GuildDataService } from '../../services/guild-data.service';
import { ItemDataService } from '../../services/item-data.service';

//interface for guild recruitment entries
export interface GuildListing {
  guildID: number,
  guildName: string,
  welcomeMessage: string,
  memberCount: string
};

//interface for pending guild request data
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
  searchInput: string; //search string to send to db for guild search
  guildListings: Array<GuildListing>; //list of all existing guilds
  pendingRequest: GuildRequest; //pending join request, should only be one
  waiting: boolean; //waiting for request response - cannot send request in this state

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

    this.playerName = this.playerData.getData().username;

    this.searchRequest(); //get all currently existing guilds
    this.findPending(); //get pending request data for viewing, if exists
  };

  logout() {
    this.playerData.logout();
    this.guildData.guildReset();
    this.itemData.resetCart();
    this.itemData.resetInventory();
  };

  //search for all joinable guilds to join based on form input
  searchRequest() {
    this.guildData.searchGuilds(this.playerData.currPlayer.playerID, this.searchInput).subscribe(response => {
      if (response.status == 200 && response.data.length >= 1) {
        //save retrieved guild info 
        this.guildListings = response.data;
        return;
      } else if (response.data.length == 0) {
        console.log("no guilds retrieved");
        //reset on failed retrieval
        this.guildListings = [];
        return;
      } else {
        console.log("search guils request: " + response.error);
        return;
      }
    })
  }

  //send http request to join selected guild 
  joinRequest(listingIndex: number) {

    this.waiting = true; //go into waiting state - cannot send further join requests
    this.guildData.createRequest(this.playerData.getData().playerID, this.guildListings[listingIndex].guildID)
      .subscribe(response => {
        if (response.status == 200) {
          
          this.findPending(); //update pending request
          return;
        } else {

          this.waiting = false;
          console.log("join request error: " + response.error);
          return;
        }
      })
  };

  //get pending join request for current player only
  findPending() {
    this.guildData.retrieveRequest(this.playerData.getData().playerID)
      .subscribe(response => {

        if (response.status == 200) {
          this.pendingRequest = response.data;
          this.waiting = true;
          return;

        } else {
          console.log("get pending request error: " + response.error);
          return;
        }
      })
  }

  //delete the current join request
  deletePending() {

    this.guildData.withdrawRequest(this.playerData.getData().playerID, this.pendingRequest.guildID)
      .subscribe(response => {
        if (response.status == 200) {
          //reset pending request data
          this.pendingRequest = {
            guildID: 0,
            guildName: "",
            welcomeMessage: "",
            dateCreated: ""
          };
          this.waiting = false; //exit waiting state to allow new join request

          return;
        } else {
          console.log("request deletion error" + response.error);
          return;
        }
      })
  };

}
