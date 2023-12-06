import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerDataService } from '../../services/player-data.service';
import { GuildDataService } from '../../services/guild-data.service';
import { ItemDataService } from '../../services/item-data.service';

export interface Item {
  itemID: number,
  itemName: string,
  itemType: string,
  itemDesc: string,
  itemPrice: number,
  imgLink: string
}

export interface cartItem {
  itemID: number,
  itemName: string,
  itemType: string,
  itemDesc: string,
  itemPrice: number,
  quantity: number,
  imgLink: string
}

export interface betterCartItem {
  playerID: number,
  itemID: number,
  itemName: string,
  itemType: string,
  itemPrice: number,
  quantity: number,
  imgLink: string
}

@Component({
  selector: 'app-itemstore',
  templateUrl: './itemstore.component.html',
  styleUrls: ['./itemstore.component.css']
})
export class ItemstoreComponent implements OnInit {

  //current username
  playerName: string;

  //current balance
  currBal: number;

  //currently selected category
  currCategory: string;

  //selected item - default: blank item
  currItem = {itemID: <string>"",
              name: <string>"",
              description: <string>"",
              price: <number>0,
              category: <string>"",
              available: <boolean>false}

  //list of all available items
  allItems: Array<Item>;

  weaponList: Array<Item>;
  armorList: Array<Item>;
  cosmeticList: Array<Item>;
  medicineList: Array<Item>;
  limitedList: Array<Item>;

  betterCurrCart: Array<betterCartItem>;

  totalCost: number

  checkout: boolean;
  processing: boolean;

  constructor(private itemData: ItemDataService, private playerData: PlayerDataService, private guildData: GuildDataService) {
    this.playerName = this.playerData.getData().username;
    this.currBal = this.playerData.getData().currentBalance;

    this.currItem;
    this.currCategory = "weapon";

    this.allItems = [];
    this.weaponList = [];
    this.armorList = [];
    this.cosmeticList = [];
    this.medicineList = [];
    this.limitedList = [];

    this.betterCurrCart = [];

    this.totalCost = 0;

    this.checkout = false;
    this.processing = false;
  };

  ngOnInit() {

    let validToken = this.playerData.verifyToken();
    console.log(validToken);

    this.getStock();
  }


  //pull all items available for purchase from database
  getStock() {
    //http request via itemstore.service to get array of items
    this.itemData.retrieveStock()
      .subscribe(response => {
        if (response.status == 200) {
          console.log(response.data);
          this.allItems = response.data;
          this.sortItems();
        } else {
          console.log(response.error);
        }
      })

  };

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
  }

  changeCategory(category: string) {
    this.currCategory = category;
    console.log(this.currCategory);
  };

  betterAddToCart(iID: number, quantity: string) {

    let selQuantity = +quantity;
    console.log(iID);

    if (this.processing) {
      return;
    };

    //pull the appropriate item object from the stock list based on id
    let selectedItem = this.allItems.filter((item) => {
      return item.itemID == iID;
    });
    console.log(selectedItem);
    //console.log("Selected Item ID: " + selectedItem[0].itemID);

    try {
      //check if this item has already been added to the cart
      let existingItem = this.betterCurrCart.filter((item) => {
        return item.itemID == iID;
      })
      //if so, update the selected quantity
      if (existingItem.length > 0) {

        //if the quantity is 0, remove from the list altogether
        if (selQuantity == 0) {
          for (let i = 0; i < this.betterCurrCart.length; i++) {
            if (this.betterCurrCart[i].itemID == iID) {
              this.betterCurrCart.splice(i, 1);
              this.betterUpdateSum();
              return;
            };
          };
        };

        existingItem[0].quantity = selQuantity;
        this.betterUpdateSum();
        return;
      }
      //if not, create new cartItem and add to cart
      let newCartItem = {
        playerID: this.playerData.getData().playerID,
        itemID: selectedItem[0].itemID,
        itemName: selectedItem[0].itemName,
        itemType: selectedItem[0].itemType,
        itemPrice: selectedItem[0].itemPrice,
        quantity: selQuantity,
        imgLink: selectedItem[0].imgLink,
      };

      console.log(newCartItem);
      this.betterCurrCart.push(newCartItem);
      this.itemData.betterSetCart(this.betterCurrCart);
      this.betterUpdateSum();

    } catch (error) {
      console.log("no selected item: " + error);
    };
  };

  removeFromCart(iID: number) {

    try {

      for (let i=0; i<this.betterCurrCart.length; i++) {
        if (this.betterCurrCart[i].itemID == iID) {
          this.betterCurrCart.splice(i, 1);
          return;
        };
      };

    } catch (error) {

      console.log("deletion error");

    };

  };

  //purchase a currently selected item
  betterPurchaseItems() {
    //http request via transaction.service to record/update transaction
    if (this.betterCurrCart.length > 0) {
      this.processing = true;
      this.itemData.betterSubmitOrder(this.playerData.getData().playerID)
        .subscribe(response => {
          if (response.status == 200) {
            this.currBal -= this.betterCurrCart[this.betterCurrCart.length - 1].itemPrice;
            this.betterCurrCart.pop();
            this.itemData.betterSetCart(this.betterCurrCart);
            this.betterPurchaseItems();
          } else {
            this.processing = false;
            console.log(response.error);
          };

        })
    } else {
      this.processing = false;
    }
  };

  startCheckout() {
    this.checkout = true;
  };

  storeRedirect() {
    this.checkout = false;
  }

  betterUpdateSum() {
    this.totalCost = 0;

    for (let i = 0; i < this.betterCurrCart.length; i++) {
      this.totalCost += this.betterCurrCart[i].itemPrice * this.betterCurrCart[i].quantity;
    }
  }

  logout() {
    this.playerData.logout();
    this.itemData.resetCart();
    this.guildData.guildReset();
    this.itemData.resetInventory();
  };


}
