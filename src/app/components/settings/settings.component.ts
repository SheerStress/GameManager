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
  form: FormGroup;
  sent: boolean;
  updateComplete: boolean;


  constructor(private router: Router, private formBuilder: FormBuilder, private playerData: PlayerDataService, private itemData: ItemDataService, private guildData: GuildDataService) {

    this.playerName = this.playerData.getData().username;

    this.changingUsername = false;
    this.changingPassword = false;
    this.changingPhone = false;

    this.newUsername = "";
    this.oldPassword = "";
    this.newPassword = "";
    this.newPhone = "";

    this.usernameForm = new FormGroup({
      username: new FormControl('')
    });

    this.passwordForm = new FormGroup({
      old_password: new FormControl(''),
      password: new FormControl('')
    });

    this.phoneForm = new FormGroup({
      phone: new FormControl('')
    });

    this.form = new FormGroup({
      username: new FormControl(''),
      old_password: new FormControl(''),
      password: new FormControl(''),
      phone: new FormControl('')
    });
    this.sent = false;
    this.updateComplete = false;

  };

  ngOnInit() {

    let validToken = this.playerData.verifyToken();
    console.log(validToken);

    this.usernameForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(16)]]
    });

    this.passwordForm = this.formBuilder.group({
      old_password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(32)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(32)]],
    });

    this.phoneForm = this.formBuilder.group({
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(13)]]
    })

    this.form = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(16)]],
      old_password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(32)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(32)]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(13)]]
    });
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

    this.sent = true;
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

          this.logout();
          this.router.navigateByUrl("/");

        } else {
          console.log(response.error);
        };

      })
  };

  setPassword() {
    this.changingPassword = true;
  };

  updatePassword() {

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
          console.log(response.error);
        };

      });
  };

  setPhone() {
    this.changingPhone = true;
  }

  updatePhone() {

    this.sent = true;
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

          this.logout();
          this.router.navigateByUrl("/");

        } else {
          console.log(response.error);
        }
      })
  };

  cancel() {
    
    this.changingUsername = false;
    this.changingPassword = false;
    this.changingPhone = false;
  };

  logout() {
    this.sent = false;
    this.playerData.logout();
    this.guildData.guildReset();
    this.itemData.resetCart();
    this.itemData.resetInventory();
  }

}
