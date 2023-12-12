import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerDataService } from '../../services/player-data.service';
import { GuildDataService } from '../../services/guild-data.service';
import { ItemDataService } from '../../services/item-data.service';

//interface for items retrieved from database
export interface Item {
  itemID: number,
  itemName: string,
  itemType: string,
  itemDesc: string,
  itemPrice: number,
  imgLink: string
}

//interface for items in the player's cart
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

//Component for Item Store feature
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

  //item list by category
  weaponList: Array<Item>;
  armorList: Array<Item>;
  cosmeticList: Array<Item>;
  medicineList: Array<Item>;
  limitedList: Array<Item>;

  //current list of items to buy
  betterCurrCart: Array<betterCartItem>;

  //total order cost
  totalCost: number

  //for UI conditions
  checkout: boolean;
  processing: boolean;
  error: boolean;
  errorMsg: string;

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
    this.error = false;
    this.errorMsg = "";
  };

  ngOnInit() {

    let validToken = this.playerData.verifyToken();//check that session is still valid

    this.getStock(); //get current stock of available items from database
    this.betterCurrCart = this.itemData.getCart();
    this.betterUpdateSum();
  }


  //pull all items available for purchase from database
  getStock() {

    //http request via itemstore.service to get array of items

    this.resetError();
    this.itemData.retrieveStock()
      .subscribe(response => {
        if (response.status == 200) {
          this.allItems = response.data;//set all items to retrieved array
          this.sortItems();
        } else {
          this.error = true;
          this.errorMsg = response.error;
          console.log("stock retrieval error" + response.error);
          return;
        }
      })

  };

  //sort items retrieved from database by category
  sortItems() {

    this.resetError();
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

  //change category to display
  changeCategory(category: string) {
    this.resetError();
    this.currCategory = category;
  };

  //add new item to cart, or adjust quantity of selected item in cart
  betterAddToCart(iID: number, quantity: string) { //iID is id of selected item, quantity is number to purchase (passed as a string from html, but later converted to number)

    let selQuantity = +quantity;
    this.resetError();

    //if a purchase is currently being processed, do not allow cart additions
    if (this.processing) {
      return;
    };

    //pull the appropriate item object from the stock list based on id
    let selectedItem = this.allItems.filter((item) => {
      return item.itemID == iID;
    });

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

      this.betterCurrCart.push(newCartItem); //add item to cart
      this.itemData.betterSetCart(this.betterCurrCart); //update service cart - to preserve state between components
      this.betterUpdateSum(); //update order total

    } catch (error) {
      console.log("no selected item: " + error);
    };
  };

  //remove a selected item from cart at checkout
  removeFromCart(iID: number) { //iID -> id of item to to be removed

    try {
      this.resetError();
      for (let i=0; i<this.betterCurrCart.length; i++) {
        if (this.betterCurrCart[i].itemID == iID) {
          this.betterCurrCart.splice(i, 1);
          return;
        };
      };

    } catch (error) {
      console.log("deletion error");
      return;
    };

  };

  //purchase an array of selected items
  betterPurchaseItems() {
    //http request via item data service to record/update transaction if there is at least one item to purchase

    
    //go into processing state to prevent additional orders
    this.resetError();
    if (this.betterCurrCart.length > 0) {
      this.processing = true;

      this.itemData.betterSubmitOrder(this.playerData.getData().playerID)
        .subscribe(response => {
          if (response.status == 200) {//on successful order submission
            this.currBal -= this.betterCurrCart[this.betterCurrCart.length - 1].itemPrice * this.betterCurrCart[this.betterCurrCart.length - 1].quantity; //update current player balance
            this.betterCurrCart.pop();//remove item from cart
            this.itemData.betterSetCart(this.betterCurrCart);//update current cart 
            this.betterPurchaseItems();//call function again to process next item
          } else {
            this.processing = false;
            this.error = true;
            this.errorMsg = response.error;
            console.log("order submission error" + response.error);
            return;
          };

        })
    } else {
      this.processing = false;
      return;
    }
  };

  startCheckout() {
    this.checkout = true;
  };

  storeRedirect() {
    this.checkout = false;
  };

  resetError() {
    this.error = false; //reset error state after failed request
  }

  //update total order cost for checkout display
  betterUpdateSum() {
    this.totalCost = 0;

    for (let i = 0; i < this.betterCurrCart.length; i++) {
      this.totalCost += this.betterCurrCart[i].itemPrice * this.betterCurrCart[i].quantity; //total cost is: sum of (item(n) cost * item(n) quantity) -> where n ranges from 1 to total item count
    }
  }

  logout() {
    this.resetError()
    this.playerData.logout();
    this.itemData.resetCart();
    this.guildData.guildReset();
    this.itemData.resetInventory();
  };


}
