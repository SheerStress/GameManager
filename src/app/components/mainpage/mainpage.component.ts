import { Component, Renderer2, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerDataService } from '../../services/player-data.service';
import { GuildDataService } from '../../services/guild-data.service';
import { ItemDataService } from '../../services/item-data.service';

@Component({
  selector: 'app-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.css']
})
export class MainpageComponent implements OnInit {

  playerName: string;
  greeting: string; //system greeting for all users
  guildPath: string; //redirect path depending on guild affiliation state - /gsearch(non-affiliated) or /guild(affiliated)
  error: boolean;
  errorMsg: string;

  constructor(private router: Router, private playerdata: PlayerDataService, private guilddata: GuildDataService, private itemData: ItemDataService, private renderer: Renderer2) {
    this.playerName = "";
    this.greeting = "";
    this.guildPath = "/gsearch";
    this.error = false;
    this.errorMsg = "";
  };

  ngOnInit() {
    console.log("main page initialized");


    let validToken = this.playerdata.verifyToken();//check if session token is valid


    this.playerName = this.playerdata.getData().username;
    this.greeting = "What service are you looking for, " + this.playerdata.getData().username + "?"

    //get data on player's guild, if affiliated
    this.guilddata.retrieveGuild(this.playerdata.getData().playerID)
    .subscribe(response => {

      if (response.status == 200) {
        this.guilddata.updateGuild(response.data, this.playerdata.getData().playerID);
        this.guildPath = "/guild";
      } else {
        this.guildPath = "/gsearch";
        this.guilddata.guildReset();
        console.log(response.error);
      }
    })

  }

  //redirect user who clicks "Guild" button based on current guild path
  guildRedirect() {
    this.router.navigateByUrl(this.guildPath);
  };

  logout() {
    this.playerdata.logout();
    this.guilddata.guildReset();
    this.itemData.resetCart();
    this.itemData.resetInventory();
  };
};
