import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlayerDataService } from '../../services/player-data.service';
import { GuildDataService } from '../../services/guild-data.service';
import { ItemDataService } from '../../services/item-data.service';

@Component({
  selector: 'app-guildcreate',
  templateUrl: './guildcreate.component.html',
  styleUrls: ['./guildcreate.component.css']
})
export class GuildcreateComponent implements OnInit {

  playerName: string;
  newName: string;
  newWelcome: string;//new welcome message for guild recruitment listing
  newGreeting: string;//new greeting message for members
  requestSuccess: boolean;//successful http request state
  requestError: boolean;//failed http request state
  form: FormGroup; //form for new guild infomation fields (name, welcome, greeting)
  submitted: boolean; //form submission state

  constructor(private playerData: PlayerDataService, private guildData: GuildDataService, private itemData: ItemDataService, private formBuilder: FormBuilder) {

    this.playerName = "";
    this.newName = "";
    this.newWelcome = "";
    this.newGreeting = "";
    this.requestSuccess = false;
    this.requestError = false;
    this.form = new FormGroup({
      name: new FormControl(''),
      welcome: new FormControl(''),
      greeting: new FormControl('')
    });
    this.submitted = false;
  };

  ngOnInit() {

    let validToken = this.playerData.verifyToken(); //check that session token is still valid

    this.playerName = this.playerData.getData().username;

    this.form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(32)]], //guild name must be submitted, and cannot exceed 32 characters
      welcome: ['', [Validators.required, Validators.maxLength(255)]], //welcome message must be submited, and cannot exceed 255 characters
      greeting: ['', [Validators.maxLength(255)]] //guild greeting is not necessary, but if used, must not excceed 255 characters
    })
  };

  //get current form control state to check for errors
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  };

  logout() {
    this.playerData.logout();
    this.guildData.guildReset();

    this.itemData.resetCart();
    this.itemData.resetInventory();
  };

  //send http request to create new guild in db
  createGuildRequest() {

    //enter form submitted state
    this.submitted = true;
    //do not submit http if form has issues
    if (this.form.invalid) {
      return;
    };
    //use guild data service to send request to middleware
    this.guildData.createGuild(this.playerData.currPlayer.playerID, this.newName, this.newWelcome, this.newGreeting)
      .subscribe(response => {
        if (response.status == 200) {
          //enter request success state
          this.requestSuccess = true;
          //update current guild data for use in guild page
          this.guildData.retrieveGuild(this.playerData.getData().playerID)
            .subscribe(response => {
              console.log(response.data);
              if (response.status == 200) {
                this.guildData.updateGuild(response.data, this.playerData.getData().playerID);
              } else {
                this.requestError = true;
                console.log(response.error);
                return;
              }
            })
        } else {
          this.requestError = true;
          console.log(response.error);
          return;
        };

      })
  }
}
