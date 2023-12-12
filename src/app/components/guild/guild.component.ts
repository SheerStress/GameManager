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

  playerName: string;//username of current player
  guildName: string;//name of currently affiliated guild
  guildGreeting: string;//greeting for all guild members

  guildMembers: Array<string>; //array of the names of all current members belonging to same guild
  guildLeader: string;
  guildMessages: Array<GuildMessage>; //array of guild messages from other guild members/leader
  guildRequests: Array<GuildRequest>; //array of all pending guild join requests - used by leader

  altMessage: string;
  altMembers: string; //message to display in place of member list
  isLeader: boolean; //if current player is the leader of current guild
  isMember: boolean; //if current player is a member of current guild

  newMessage: string; //new guild message to be sent to other members

  form: FormGroup;//guild message form
  sent: boolean; //message send status
  confirmation: boolean; //confirm guild disband/withdraw

  constructor(private router: Router, private formBuilder: FormBuilder, private guildData: GuildDataService, private playerData: PlayerDataService, private itemData: ItemDataService) {

    //initialize variables
    this.playerName = "";
    this.guildName = "";
    this.guildGreeting = this.guildData.getData().guild.guildGreeting; 

    this.guildMembers = [];
    this.guildLeader = this.guildData.getData().leader.username;
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

    let validToken = this.playerData.verifyToken();//check if session token is still valid before anything else

    this.playerName = this.playerData.getData().username;
    console.log("guild page initialized");

    this.guildData.retrieveGuild(this.playerData.getData().playerID)
      .subscribe(response => {

        if (response.status == 200) {
          this.guildData.updateGuild(response.data, this.playerData.getData().playerID);
          this.guildName = this.guildData.currGuild.guild.guildName;

          if (this.guildData.currGuild.leader.playerID == this.playerData.getData().playerID) {
            this.isLeader = true;
          };

        } else {
          this.guildData.guildReset(); //reset all guild data if no affiliated guild is found in database
          this.isLeader = false;
          console.log(response.error);
        }
      })


    this.form = this.formBuilder.group({
      message: ['', [Validators.required, Validators.maxLength(255)]] //guild message cannot be blank, and not more than 255 characters
    });

    this.guildData.retrieveMembers(this.playerData.getData().playerID) //get list of fellow guild members - excluding leader
    .subscribe(response => {
      if (response.data) {
        for (let i=0; i<response.data.length; i++) {
          this.guildMembers.push(response.data[i]);
        };
        if (this.guildMembers.length == 0) {
          this.altMessage = "Looks like you don't have any members... yet."; 
        }
      } else {
        console.log(response.error);
        return;
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

  //send the currently typed message
  sendMessage() {
    this.sent = true;
    if (this.form.invalid) {
      return;
    };

    this.guildData.createMessage(this.playerData.getData().playerID, this.newMessage)
      .subscribe(response => {
        if (response.status == 200) {
          this.requestMessages();
          this.sent = false;
          return;
        };
        console.log(response.error);
        this.sent = false
        return;
      })
  };

  //get all messages previously sent by fellow guild members
  requestMessages() {
    this.guildData.getMessages(this.playerData.getData().playerID)
      .subscribe(response => {
        if (response.data) {
          //get array of message objects
          this.guildMessages = response.data;
          //use alternate message if no messages are found
          if (this.guildMessages.length == 0) {
            this.altMembers = "Looks like you don't have any guild messages... yet.";
          };
          return;
        } else {
          console.log(response.error);
          return;
        };
      });
  };

  //withdraw from current guild (member only)
  withdraw() {
    this.guildData.withdrawMember(this.playerData.getData().playerID)
      .subscribe(response => {
        if (response.status == 200) {
          this.isMember = false;

          //log user out after successful withdrawal
          this.logout();
          this.router.navigateByUrl("/");

          return;
        } else {
          console.log(response.error)
          return;
        }
      })
  }

  //disband(delete) guild (leader only)
  disbandGuild() {
    this.guildData.deleteGuild(this.playerData.getData().playerID)
      .subscribe(response => {
        if (response.status == 200) {
          this.isMember = false;
          this.isLeader = false;
          //log user out on successful disband
          this.logout();
          this.router.navigateByUrl("/");
          console.log("successful deletion");
          return;
        } else {
          console.log(response.error);
          return;
        }
      })
  };

  //function to accept a received guild join request - to be used by a guild leader
  acceptRequest(index: number) { //index of the accepted request in the guildRequests array

    let pID: number = this.guildRequests[index].playerID;

    this.guildData.addMember(pID) //adds new guild member by sending the id of the player to be added
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
                return;
              }
            });
        }
      })
  };

  //use guild data service to get all pending requests for current guild - leader only
  getAllRequests() {
    this.guildData.retrieveAllRequests(this.playerData.getData().playerID)
      .subscribe(response => {

        if (response.status == 200) {

          this.guildRequests = response.data
        } else {
          console.log(response.error);
          return;
        };

      })
  }

  //get currently pending guild join requests for current player - non-affiliated only
  getRequest() {
    this.guildData.retrieveRequest(this.playerData.getData().playerID)
      .subscribe(response => {
        if (response.status == 200) {
          this.guildRequests = response.data
        } else {
          console.log(response.error);
          return;
        }
      })
  }

  //reject a specific guild join request
  rejectRequest(index: number) {

    let pID: number = this.guildRequests[index].playerID;

    this.guildData.rejectRequest(pID)
      .subscribe(response => {
        if (response.status == 200) {
          this.guildRequests.splice(index, 1);//remove request from array
        } else {
          console.log(response.error);
          return;
        }
      })
  };


}
