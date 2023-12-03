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
  newWelcome: string;
  newGreeting: string;
  requestSuccess: boolean;
  requestError: boolean;
  form: FormGroup;
  submitted: boolean;

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

    let validToken = this.playerData.verifyToken();
    console.log(validToken);

    this.playerName = this.playerData.getData().username;

    this.form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(32)]],
      welcome: ['', [Validators.required, Validators.maxLength(255)]],
      greeting: ['', [Validators.maxLength(255)]]
    })
  };
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  };

  logout() {
    this.playerData.logout();
    this.guildData.guildReset();

    this.itemData.resetCart();
    this.itemData.resetInventory();
  };

  createGuildRequest() {

    this.submitted = true;
    if (this.form.invalid) {
      return;
    };

    this.guildData.createGuild(this.playerData.currPlayer.playerID, this.newName, this.newWelcome, this.newGreeting)
      .subscribe(response => {
        if (response.status == 200) {
          this.requestSuccess = true;
          this.guildData.retrieveGuild(this.playerData.getData().playerID)
            .subscribe(response => {
              console.log(response.data);
              if (response.status == 200) {
                this.guildData.updateGuild(response.data, this.playerData.getData().playerID);
              } else {
                console.log(response.error);
              }
            })
        } else {
          console.log(response.error);
        }
      })
  }
}
