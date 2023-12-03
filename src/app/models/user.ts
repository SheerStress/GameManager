import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlayerDataService } from '../services/player-data.service';


export class User {

  constructor(private playerdata: PlayerDataService) {

  }

  getEmail() {
    //return this.userData.emailAddress;
  }

  getPhone() {
    //return this.userData.phoneNumber;
  }

  getLanguage() {
    //return this.userData.language
  }

  setEmail(newEmail: string) {
    //this.userData.emailAddress = newEmail;
    //let dataString: string = JSON.stringify(this.userData);

    this.playerdata.setUserData(newEmail);
  }

  setPassword(newPass: string) {
    //this.userData.passwordHash = newPass
  }

  setPhone(newPhone: string) {
    //this.userData.phoneNumber = newPhone;
  }
}
