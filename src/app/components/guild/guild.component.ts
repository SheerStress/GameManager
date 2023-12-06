import { Component, OnInit } from '@angular/core';
import { Guild } from '../../models/guild';
import { Router } from '@angular/router';
import { AbstractControl, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlayerDataService } from '../../services/player-data.service';
import { GuildDataService } from '../../services/guild-data.service';
import { ItemDataService } from '../../services/item-data.service';

export interface MemberList {
  username: string
}

export interface GuildMessage {
  username: string,
  messageContent: string,
  dateCreated: string
}

export interface GuildRequest {
  playerID: number,
  username: string,
  dateCreated: string
}

@Component({
  selector: 'app-guild',
  templateUrl: './guild.component.html',
  styleUrls: ['./guild.component.css']
})
export class GuildComponent implements OnInit {

  playerName: string;
  guildName: string;
  guildGreeting: string;

  guildMembers: Array<string>;
  guildMessages: Array<GuildMessage>;
  guildRequests: Array<GuildRequest>;

  altMessage: string;
  altMembers: string;
  isLeader: boolean;
  isMember: boolean;

  newMessage: string;

  form: FormGroup;
  sent: boolean;
  confirmation: boolean;

  constructor(private router: Router, private formBuilder: FormBuilder, private guildData: GuildDataService, private playerData: PlayerDataService, private itemData: ItemDataService) {

    this.playerName = "";
    this.guildName = "";
    this.guildGreeting = this.guildData.getData().guild.guildGreeting;

    this.guildMembers = [];
    this.guildMessages = [{
      username: <string>"",
      messageContent: <string>"",
      dateCreated: <string>""
    }];
    this.guildRequests = [];
    this.altMessage = "";
    this.altMembers = "";
    this.isLeader = false;
    this.isMember = true;
    this.newMessage = "";
    this.form = new FormGroup({
      message: new FormControl('')
    })
    this.sent = false;
    this.confirmation = false;
  };

  ngOnInit() {

    let validToken = this.playerData.verifyToken();
    console.log(validToken);

    this.playerName = this.playerData.getData().username;
    console.log("guild page initialized");
    //this.guildData.betterUpdateGuild(this.playerData.getData().playerID);
    this.guildData.retrieveGuild(this.playerData.getData().playerID)
      .subscribe(response => {
        console.log(response.data);

        if (response.status == 200) {

          this.guildData.updateGuild(response.data, this.playerData.getData().playerID);

          this.guildName = this.guildData.currGuild.guild.guildName;

          if (this.guildData.currGuild.leader.playerID == this.playerData.getData().playerID) {
            this.isLeader = true;
          };

        } else {

          this.guildData.guildReset();
          this.isLeader = false;
          console.log(response.error);
        }
      })


    this.form = this.formBuilder.group({
      message: ['', [Validators.required, Validators.maxLength(255)]]
    });

    this.guildData.retrieveMembers(this.playerData.getData().playerID)
    .subscribe(response => {
      if (response.data) {
        for (let i=0; i<response.data.length; i++) {
          this.guildMembers.push(response.data[i]);
          console.log("member " + (i + 1) + ": " + response.data[i]);
        };
        if (this.guildMembers.length == 0) {
          this.altMessage = "Looks like you don't have any members... yet.";
        }
      } else {
        console.log(response.error);
      }
    });

    this.requestMessages();
    this.getAllRequests();
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

  sendMessage() {
    this.sent = true;
    if (this.form.invalid) {
      return;
    };

    this.guildData.createMessage(this.playerData.getData().playerID, this.newMessage)
      .subscribe(response => {
        if (response.status == 200) {
          console.log("message sent!");
          this.requestMessages();
          this.sent = false;
          return;
        };
        console.log(response.error);
        return;
      })
  };

  requestMessages() {
    this.guildData.getMessages(this.playerData.getData().playerID)
      .subscribe(response => {
        if (response.data) {
          this.guildMessages = response.data;
          if (this.guildMessages.length == 0) {
            this.altMembers = "Looks like you don't have any guild messages... yet.";
          }
        } else {
          console.log(response.error);
        };
      });
  };


  withdraw() {
    this.guildData.withdrawMember(this.playerData.getData().playerID)
      .subscribe(response => {
        if (response.status == 200) {
          this.isMember = false;
          this.guildData.guildReset();
          this.router.navigateByUrl("/");
          console.log("successful withdrawal");
        } else {
          console.log(response.error)
        }
      })
  }

  disbandGuild() {
    this.guildData.deleteGuild()
      .subscribe(response => {
        if (response.status == 200) {
          this.isMember = false;
          this.isLeader = false;
          this.guildData.guildReset();
          this.router.navigateByUrl("/");
          console.log("successful deletion");
        } else {
          console.log(response.error);
        }
      })
  };

  acceptRequest(index: number) {

    let pID: number = this.guildRequests[index].playerID;

    this.guildData.addMember(pID)
      .subscribe(response => {
        if (response.status == 200) {
          this.guildData.retrieveMembers(this.playerData.getData().playerID)
            .subscribe(response => {
              if (response.data) {
                this.guildMembers = [];
                for (let i = 0; i < response.data.length; i++) {
                  this.guildMembers.push(response.data[i].username);
                };
                if (this.guildMembers.length == 0) {
                  this.altMessage = "Looks like you don't have any members... yet.";
                }
                this.guildRequests.splice(index, 1);
              } else {
                console.log(response.error);
              }
            });
        }
      })
  };

  getAllRequests() {
    this.guildData.retrieveAllRequests(this.playerData.getData().playerID)
      .subscribe(response => {

        if (response.status == 200) {
          console.log(response.data);
          this.guildRequests = response.data
        } else {
          console.log(response.error);
        };

      })
  }

  getRequest() {
    this.guildData.retrieveRequest(this.playerData.getData().playerID)
      .subscribe(response => {
        if (response.status == 200) {
          this.guildRequests = response.data
        } else {
          console.log(response.error);
        }
      })
  }

  rejectRequest(index: number) {

    let pID: number = this.guildRequests[index].playerID;

    this.guildData.rejectRequest(pID)
      .subscribe(response => {
        if (response.status == 200) {
          this.guildRequests.splice(index, 1);
        } else {
          console.log(response.error);
        }
      })
  };


}
