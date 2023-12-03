import { Component, OnInit } from '@angular/core';
import { PlayerDataService } from '../../services/player-data.service';
import { ItemDataService } from '../../services/item-data.service';
import { GuildDataService } from '../../services/guild-data.service';

export interface playerItem {

  itemID: number,
  itemName: string,
  itemType: string,
  quantity: number,
  imgLink: string
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent {

  playerName: string;
  currCategory: string;
  discarding: boolean;

  //list of all owned items
  allItems: Array<playerItem>;

  weaponList: Array<playerItem>;
  armorList: Array<playerItem>;
  cosmeticList: Array<playerItem>;
  medicineList: Array<playerItem>;
  limitedList: Array<playerItem>;


  constructor(private playerData: PlayerDataService, private itemData: ItemDataService, private guildData: GuildDataService) {

    this.playerName = this.playerData.getData().username;

    this.currCategory = "Weapon";
    this.discarding = false;

    this.allItems = [];
    this.weaponList = [];
    this.armorList = [];
    this.cosmeticList = [];
    this.medicineList = [];
    this.limitedList = [];

  };

  logout() {
    this.playerData.logout();
    this.guildData.guildReset();
    this.itemData.resetCart();
    this.itemData.resetInventory();
  }

}
