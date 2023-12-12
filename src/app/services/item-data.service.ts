import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface betterCartItem {
  playerID: number,
  itemID: number,
  itemName: string,
  itemType: string,
  itemPrice: number,
  quantity: number,
  imgLink: string
}

export interface InventoryItem {
  itemID: number,
  itemName: string,
  itemType: string,
  itemDesc: string,
  quantity: number,
  imgLink: string
}

@Injectable({
  providedIn: 'root'
})

//Service responsible for all item related features and data (store/inventory)
export class ItemDataService {

  domain: string;

  betterCart: Array<betterCartItem>; //cart (array of item objects)
  playerInventory: Array<InventoryItem>;//current player inventory (array of item objects) 


  constructor(private http: HttpClient) {

    this.domain = 'http://localhost:3000';
    //this.domain = 'http://gmrouting602.azurewebsites.net';

    this.betterCart = [];
    this.playerInventory = [];
  }

  retrieveStock(): Observable<any> {
    let url = this.domain + `/getStock`;

    return this.http.get(url);
  };

  getCart() {
    return this.betterCart;
  };

  betterSetCart(newCart: Array<betterCartItem>) {
    this.betterCart = newCart;
  };

  resetCart() {
    this.betterCart = [];
  };

  resetInventory() {
    this.playerInventory = [];
  };

  //send an item order to the middleware to update database - uses player id as argument
  betterSubmitOrder(id: number): Observable<any> {
    let url = this.domain + `/betterSubmitOrder`;
    let orderData = {
      playerID: id,
      itemID: this.betterCart[this.betterCart.length - 1].itemID, //id of last item in cart
      quantity: this.betterCart[this.betterCart.length - 1].quantity //number of currently selected item to buy
    };

    return this.http.post(url, orderData);
  };

  //get full inventory of current player - will be sent an array of item objects
  retrieveInventory(pID: number): Observable<any> {

    let url = this.domain + `/getInventory`;
    let requestData = {
      playerID: pID
    };

    return this.http.post(url, requestData);
  };

  //update current inventory instance with new data (from database)
  setInventory(newInventory: Array<InventoryItem>) {
    this.playerInventory = newInventory;
  };

  //discard a selected item using current player id (pID), item id (iID), and number of items to discard (quantity)
  discardItem(pID: number, iID: number, quantity: number): Observable<any> {

    let url = this.domain + `/deleteItem`;
    let discardData = {
      playerID: pID,
      itemID: iID,
      quantity: quantity
    };

    return this.http.post(url, discardData);
  };
}
