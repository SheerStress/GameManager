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
  greeting: string;
  guildPath: string;

  constructor(private router: Router, private playerdata: PlayerDataService, private guilddata: GuildDataService, private itemData: ItemDataService, private renderer: Renderer2) {
    this.playerName = "";
    this.greeting = "";
    this.guildPath = "/gsearch";
  };

  ngOnInit() {
    console.log("main page initialized");
    console.log(this.playerdata.currPlayer);

    let validToken = this.playerdata.verifyToken();
    console.log(validToken);

    this.playerName = this.playerdata.getData().username;
    this.greeting = "What service are you looking for, " + this.playerdata.getData().username + "?"

    this.guilddata.retrieveGuild(this.playerdata.getData().playerID)
    .subscribe(response => {
      console.log(response.data);
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
