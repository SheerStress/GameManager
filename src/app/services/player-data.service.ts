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

//Service responsible for all player-related features and data
export class PlayerDataService {

  domain: string;
  loggedIn: boolean;
  isLeader: boolean;
  currPlayer: PlayerResponse;

  constructor(private http: HttpClient, private router: Router, private guildData: GuildDataService, private itemData: ItemDataService) {

    this.domain = `http://localhost:3000`;
    //this.domain = 'http://gmrouting602.azurewebsites.net';

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

  //create new user from data entered into registration component
  createUser(userData: string): Observable<any> {
    let url: string = this.domain + `/addUser`;
    let newData = JSON.parse(userData);

    return this.http.post(url, newData);
  }

  //retrieve player data for current user from database
  retrievePlayer(id: number): Observable<any>{
    let url: string = this.domain + `/getPlayer`;
    let userData = {
      userID: id
    }
    return this.http.post(url, userData);
  }


  //update current player instance
  updatePlayer(data: PlayerResponse) {
    this.currPlayer = data;
  };

  //check validity of currently issued token
  verifyToken() {

    if (localStorage.getItem("gameAppToken")) {

      let url: string = this.domain + `/verifyToken`;
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

//check if user has been logged in
loginStatus() {
    return this.loggedIn;
  };

//set user to logged in status
setLogin() {
    this.loggedIn = true;
  };

//check database for existing user after log in submission
 verifyUser(email:string, pass:string): Observable<any> {

    let inputData = {

      emailAddress: <string>email,
      password: <string>pass

      };

    let url: string = this.domain + `/verifyUser`;
    console.log(this.http.post(url, inputData));
    this.verifyToken();
    return this.http.post(url, inputData);
  };

  //update current player username
  updateUsername(inputName: string): Observable<any> {
    let url: string = this.domain + `/updateUsername`;
    let newData = {
      playerID: this.currPlayer.playerID,
      newUsername: inputName
    };

    return this.http.post(url, newData);
  };

  //update current player password
  updatePassword(existingPass: string, inputPass: string): Observable<any> {
    let url: string = this.domain + `/updatePassword`;
    let newData = {
      playerID: this.currPlayer.playerID,
      oldPassword: existingPass,
      newPassword: inputPass
    };

    return this.http.post(url, newData);
  }

  //update current player phone number
  updatePhone(inputPhone: string): Observable<any> {
    let url: string = this.domain + `/updatePhone`;
    let newData = {
      playerID: this.currPlayer.playerID,
      newPhone: inputPhone
    };

    return this.http.post(url, newData);
  };

  deleteUser(): Observable<any> {
    let url: string = this.domain + "/deleteUser";
    let playerData = {
      playerID: this.currPlayer.playerID
    };

    return this.http.post(url, playerData);
  }

  //logout current player - reset all data and redirect to log in page
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


    this.router.navigateByUrl("/");
    console.log("Player data reset");
  }



  //retrieve user data from database based on email and password input
  getUserData(email: string, pass: string): Observable<any> {
    let inputData = {
      emailAddress: <string>email,
      password: <string>pass
    }
    let url: string = this.domain + `/getUser`;

    return this.http.post(url, inputData);
  }



  //dataString -> JSON string of User class data
  setUserData(dataString: string): Observable<any> {
    let newData = JSON.parse(dataString);
    let url: string = this.domain + `/updateUser`;

    return this.http.post(url, newData);
  }
  
}
