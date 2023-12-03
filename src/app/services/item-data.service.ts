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
export class ItemDataService {


  betterCart: Array<betterCartItem>;
  playerInventory: Array<InventoryItem>;


  constructor(private http: HttpClient) {

    this.betterCart = [];
    this.playerInventory = [];
  }

  retrieveStock(): Observable<any> {
    let url = `http://localhost:3000/getStock`;

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

  betterSubmitOrder(id: number): Observable<any> {
    let url = `http://localhost:3000/betterSubmitOrder`;
    let orderData = {
      playerID: id,
      itemID: this.betterCart[this.betterCart.length - 1].itemID,
      quantity: this.betterCart[this.betterCart.length - 1].quantity
    };

    return this.http.post(url, orderData);
  };

  retrieveInventory() {

  };

  setInventory(newInventory: Array<InventoryItem>) {
    this.playerInventory = newInventory;
  };

  discardItem() {

  };
}
