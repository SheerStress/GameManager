import { Component, OnInit } from '@angular/core';
import { PlayerDataService } from '../../services/player-data.service';
import { ItemDataService } from '../../services/item-data.service';
import { GuildDataService } from '../../services/guild-data.service';

export interface playerItem {

  itemID: number,
  itemName: string,
  itemType: string,
  itemDesc: string,
  quantity: number,
  imgLink: string
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {

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

    this.currCategory = "weapon";
    this.discarding = false;

    this.allItems = [];
    this.weaponList = [];
    this.armorList = [];
    this.cosmeticList = [];
    this.medicineList = [];
    this.limitedList = [];

  };

  ngOnInit() {

    let validToken = this.playerData.verifyToken();
    console.log(validToken);

    this.getInventory();
  }

  sortItems() {

    this.weaponList = [];
    this.armorList = [];
    this.medicineList = [];
    this.cosmeticList = [];
    this.limitedList = [];

    for (let i = 0; i < this.allItems.length; i++) {

      if (this.allItems[i].itemType == "Weapon") {
        this.weaponList.push(this.allItems[i]);

      } else if (this.allItems[i].itemType == "Armor") {
        this.armorList.push(this.allItems[i]);

      } else if (this.allItems[i].itemType == "Medicine") {
        this.medicineList.push(this.allItems[i]);

      } else if (this.allItems[i].itemType == "Cosmetic") {
        this.cosmeticList.push(this.allItems[i]);

      } else if (this.allItems[i].itemType == "Limited") {
        this.limitedList.push(this.allItems[i]);

      } else {
        console.log("no valid item type");
      }
    }
  };

  getInventory() {

    this.itemData.retrieveInventory(this.playerData.getData().playerID)
      .subscribe(response => {
        if (response.status == 200) {
          this.allItems = response.data;
          this.sortItems();
        } else {
          console.log(response.error)
        }
      })
  };

  changeCategory(category: string) {
    this.currCategory = category;
    console.log(this.currCategory);
  };

  discardItem(selectedID: number, selQuantity: string) {

    let selectedQuantity: number = +selQuantity;

    this.itemData.discardItem(this.playerData.getData().playerID, selectedID, selectedQuantity)
      .subscribe(response => {
        if (response.status == 200) {
          this.getInventory();
        } else {
          console.log(response.error);
        }
      })
  }

  logout() {
    this.playerData.logout();
    this.guildData.guildReset();
    this.itemData.resetCart();
    this.itemData.resetInventory();
  }

}
