import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ItemDataService } from './item-data.service';
import { GuildDataService } from './guild-data.service'


export interface TokenResponse {
  status: number,
  data: boolean,
  error: string
};

export interface SessionResponse {
  status: number,
  error: string
};

export interface Inventory {
  itemID: number,
  itemName: string,
  itemType: string,
  quantity: number
}

export interface PlayerResponse {

      playerID: number,
      username: string,
      currentBalance: number
};


@Injectable({
  providedIn: 'root'
})

export class PlayerDataService {

  loggedIn: boolean;
  isLeader: boolean;
  currPlayer: PlayerResponse;

  constructor(private http: HttpClient, private router: Router, private guildData: GuildDataService, private itemData: ItemDataService) {
    this.loggedIn = false;
    this.isLeader = false;
    this.currPlayer = {

      playerID: <number>0,
      username: <string>"",
      currentBalance: <number>0
    };
  }

  getData() {
    return this.currPlayer;
  }

  createUser(userData: string): Observable<any> {
    let url: string = `http://localhost:3000/addUser`;
    let newData = JSON.parse(userData);

    return this.http.post(url, newData);
  }

  retrievePlayer(id: number): Observable<any>{
    let url: string = `http://localhost:3000/getPlayer`;
    let userData = {
      userID: id
    }
    return this.http.post(url, userData);
  }




  updatePlayer(data: PlayerResponse) {
    this.currPlayer = data;
  }




  verifyToken() {

    if (localStorage.getItem("gameAppToken")) {

      let url: string = `http://localhost:3000/verifyToken`;
      let accessToken = localStorage.getItem("gameAppToken" || "");
      let headerData = new HttpHeaders();
      headerData = headerData.set('Authorization', accessToken || "");
      this.http.get<TokenResponse>(url, {headers: headerData}).subscribe(response => {

        if (response.data) {
          this.loggedIn = true;
          console.log("token verified");
          return true;
        } else {
          console.log(response.error);
          localStorage.removeItem("gameAppToken");
          this.router.navigateByUrl('/');
          this.loggedIn = false;
          return false;
        };

      });
    };

  };


  loginStatus() {
    return this.loggedIn;
  };

  setLogin() {
    this.loggedIn = true;
  };


  verifyUser(email:string, pass:string): Observable<any> {

    let inputData = {

      emailAddress: <string>email,
      password: <string>pass

      };

    let url: string = `http://localhost:3000/verifyUser`;
    console.log(this.http.post(url, inputData));
    this.verifyToken();
    return this.http.post(url, inputData);
  };

  updateUsername(inputName: string): Observable<any> {
    let url: string = `http://localhost:3000/updateUsername`;
    let newData = {
      playerID: this.currPlayer.playerID,
      newUsername: inputName
    };

    return this.http.post(url, newData);
  };

  updatePassword(existingPass: string, inputPass: string): Observable<any> {
    let url: string = `http://localhost:3000/updatePassword`;
    let newData = {
      playerID: this.currPlayer.playerID,
      oldPassword: existingPass,
      newPassword: inputPass
    };

    return this.http.post(url, newData);
  }

  updatePhone(inputPhone: string): Observable<any> {
    let url: string = `http://localhost:3000/updatePhone`;
    let newData = {
      playerID: this.currPlayer.playerID,
      newPhone: inputPhone
    };

    return this.http.post(url, newData);
  }


  logout() {
    this.loggedIn = false;

    this.currPlayer = {

      playerID: <number>0,
      username: <string>"",
      currentBalance: <number>0
    };

    this.guildData.guildReset();
    this.itemData.resetCart();
    this.itemData.resetInventory();

    //this.http.get<SessionResponse>("/logout").subscribe(
      //response => {
        //if (response) {
          //console.log("session destroyed")
        //} else {
          //console.log("session destroy error");
        //};
      //});

    this.router.navigateByUrl("/");
    console.log("Player data reset");
  }




  getUserData(email: string, pass: string): Observable<any> {
    let inputData = {
      emailAddress: <string>email,
      password: <string>pass
    }
    let url: string = `http://localhost:3000/getUser`;

    return this.http.post(url, inputData);
  }



  //dataString -> JSON string of User class data
  setUserData(dataString: string): Observable<any> {
    let newData = JSON.parse(dataString);
    let url: string = `http://localhost:3000/updateUser`;

    return this.http.post(url, newData);
  }
  
}
