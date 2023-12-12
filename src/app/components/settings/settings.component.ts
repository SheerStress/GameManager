import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerDataService } from '../../services/player-data.service';
import { ItemDataService } from '../../services/item-data.service';
import { GuildDataService } from '../../services/guild-data.service';
import { AbstractControl, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';



@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  playerName: string;

  changingUsername: boolean;
  changingPassword: boolean;
  changingPhone: boolean;

  newUsername: string;
  oldPassword: string;
  newPassword: string;
  newPhone: string;

  usernameForm: FormGroup;
  passwordForm: FormGroup;
  phoneForm: FormGroup;

  sent: boolean;

  updateComplete: boolean;
  updateError: boolean;
  deleteConfirm: boolean;
  deleteError: boolean;


  constructor(private router: Router, private formBuilder: FormBuilder, private playerData: PlayerDataService, private itemData: ItemDataService, private guildData: GuildDataService) {

    this.playerName = this.playerData.getData().username;

    this.changingUsername = false;
    this.changingPassword = false;
    this.changingPhone = false;

    this.newUsername = "";
    this.oldPassword = "";
    this.newPassword = "";
    this.newPhone = "";

    //form for new username
    this.usernameForm = new FormGroup({
      username: new FormControl('')
    });

    //form for new password
    this.passwordForm = new FormGroup({
      old_password: new FormControl(''),
      password: new FormControl('')
    });

    //form for new phone number
    this.phoneForm = new FormGroup({
      phone: new FormControl('')
    });

    this.sent = false;

    //on db error - enter this state
    this.updateError = false;
    //on db update success - enter this state
    this.updateComplete = false;

    //account deletion states
    this.deleteConfirm = false;
    this.deleteError = false;

  };

  ngOnInit() {

    let validToken = this.playerData.verifyToken(); //verify current session token
    console.log(validToken);

    this.usernameForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(16)]] //new username is required, must be between 2-16 characters
    });

    this.passwordForm = this.formBuilder.group({
      old_password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(32)]], //old password for verification - does not actually work in current form
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(32)]], //new password to be stored in db
    });

    this.phoneForm = this.formBuilder.group({
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(13)]] //new phone is required, should be between 10-13 digits, with variability for country codes, etc.
    })
  };

  get getUser(): { [key: string]: AbstractControl } {
    return this.usernameForm.controls;
  };

  get getPass(): { [key: string]: AbstractControl } {
    return this.passwordForm.controls;
  };

  get getPhone(): { [key: string]: AbstractControl } {
    return this.phoneForm.controls;
  };

  setUsername() {
    this.changingUsername = true;
  };

  updateUsername() {

    //if form has validator issues, do not send http
    this.sent = true;
    this.updateError = false;
    if (this.usernameForm.invalid) {
      console.log("Invalid form");
      return;
    };

    this.playerData.updateUsername(this.newUsername)
      .subscribe(response => {

        if (response.status == 200) {
          this.changingUsername = false;
          this.updateComplete = true;
          this.sent = false;

          //log out on successful update
          this.logout();
          this.router.navigateByUrl("/");

        } else {
          this.updateError = true;
          console.log(response.error);
          return;
        };

      })
  };

  setPassword() {
    this.changingPassword = true;
  };

  //send request to update player password in db
  updatePassword() {

    //don't send http if form has issues
    this.updateError = false;
    this.sent = true;
    if (this.passwordForm.invalid) {
      console.log("Invalid form");
      return;
    };

    this.playerData.updatePassword(this.oldPassword, this.newPassword)
      .subscribe(response => {
        if (response.status == 200) {
          this.changingPassword = false;
          this.updateComplete = true;
          this.sent = false;

          this.logout();
          this.router.navigateByUrl("/");

        } else {
          this.updateError = true;
          console.log(response.error);
          return;
        };

      });
  };

  setPhone() {
    this.changingPhone = true;
  }

  updatePhone() {

    this.updateError = false;
    this.sent = true;

    //if form has issues, do not send http
    if (this.phoneForm.invalid) {
      console.log("Invalid form");
      return;
    };

    this.playerData.updatePhone(this.newPhone)
      .subscribe(response => {
        if (response.status == 200) {
          this.changingPhone = false;
          this.updateComplete = true;
          this.sent = false;
          //on successful update, logout user
          this.logout();
          this.router.navigateByUrl("/");

        } else {
          this.updateError = true;
          console.log(response.error);
          return;
        }
      })
  };

  //permanently delete user account - requires confirmation
  deleteAccount() {

    try {
      this.playerData.deleteUser()
        .subscribe(response => {
          if (response.data) {
            this.logout();
          } else {
            console.log("Server Response Error");
          };
        })
    } catch (error) {
      console.log("Deletion Error");
    };

  }

  cancel() {
    //go back to initial (update selection) state
    this.changingUsername = false;
    this.changingPassword = false;
    this.changingPhone = false;
    this.updateError = false;
  };

  logout() {
    this.playerData.logout();
    this.guildData.guildReset();
    this.itemData.resetCart();
    this.itemData.resetInventory();
  }

}
