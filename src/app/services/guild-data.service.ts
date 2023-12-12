import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';



export interface GuildResponse { //guild/guild leader data received from database should be formatted this way
  guild: {
    guildID: number,
    guildName: string,
    guildGreeting: string
  },

  leader: {
    playerID: number,
    username: string
  }
};

export interface ServerResponse {
  status: number,
  data: GuildResponse | boolean,
  error: string
}

export interface GuildLeader {
  playerID: number,
  username: string
}

@Injectable({
  providedIn: 'root'
})

//Service responsible for all guild-related features and data
export class GuildDataService {

  domain: string;
  //object to store currently affiliated guild information
  currGuild: GuildResponse;
  leaderInfo: GuildLeader;
  //mark whether current player is the leader of their guild to determine UI functionality
  isLeader: boolean;

  constructor(private http: HttpClient) {

    this.domain = 'http://localhost:3000';
    //this.domain = 'http://gmrouting602.azurewebsites.net';

    this.leaderInfo = {
      playerID: 0,
      username: ""
    };

    this.isLeader = false;
;
    this.currGuild = {
      guild: {
        guildID: <number>0,
        guildName: <string>"",
        guildGreeting: <string>""
      },
      leader: {
        playerID: <number>0,
        username: <string>""
      }
    };
  }

  //get data on current guild instance
  getData() {
    return this.currGuild;
  }

  //function to create a new guild with the current player as leader - player inputs guild name, welcome message for recruitment posting, and greeting for guild members
  createGuild(id: number, name: string, welcome: string, greet: string): Observable<any> {
    let url = this.domain + `/createGuild`;
    let newData = {
      playerID: id,
      guildName: name,
      welcomeMessage: welcome,
      greeting: greet
    };
    return this.http.post(url, newData);
  };

  //function to delete(disband) guild - can only be used by guild leader
  deleteGuild(pID: number): Observable<any> {
    let url = this.domain + `/deleteGuild`;
    let guildData = {
      playerID: pID,
      guildID: this.currGuild.guild.guildID
    };

    return this.http.post(url, guildData);
  };

  guildReset() { //reset all guild info upon log out
    this.currGuild.guild = {
      guildID: 0,
      guildName: "",
      guildGreeting: ""
    };

    this.isLeader = false;

    this.currGuild.leader = {
      playerID: 0,
      username: ""
    };

    console.log("Guild data reset");
  };

  //retrieve pending guild join requests - to be used by non-affiliated players
  retrieveRequest(id: number): Observable<any> {
    let url = this.domain + `/getRequest`
    let requestData = {
      playerID: id
    };
    return this.http.post(url, requestData);
  }

  //retrieve all pending guild join requests - to be used by guild leaders
  retrieveAllRequests(id: number): Observable<any> {
    let url = this.domain + `/getAllRequests`;
    let requestData = {
      playerID: id
    };
    return this.http.post(url, requestData);
  }

  //create new guild join request - to be used by non-affiliated players (only one can exist at a time)
  createRequest(id: number, gID: number): Observable<any> {
    let url = this.domain + `/addRequest`;
    let requestData = {
      playerID: id,
      guildID: gID
    };

    return this.http.post(url, requestData);
  };

  //reject guild join request - to be used by guild leaders
  rejectRequest(id: number): Observable<any> {
    let url = this.domain + `/rejectRequest`;
    let requestData = {
      playerID: id,
      guildID: this.currGuild.guild.guildID
    };

    return this.http.post(url, requestData);
  };

  //withdraw pending guild join request - to be used by non-affiliated players
  withdrawRequest(id: number, gID: number): Observable<any> {
    let url = this.domain + `/deleteRequest`;
    let requestData = {
      playerID: id,
      guildID: gID
    };
    return this.http.post(url, requestData);
  }

  //create new guild message to be sent to all other guild members/leader - to be used by guild members/leader
  createMessage(id: number, content: string): Observable<any> {
    let url = this.domain + `/addMessage`;
    let messageData = {
      playerID: id,
      messageContent: content
    };

    return this.http.post(url, messageData);
  };

  //retrieve all previously sent guild messages - to be used by guild members/leaders
  getMessages(id: number): Observable<any> {
    let url = this.domain + `/getMessages`;
    let messageData = {
      playerID: id
    }

    return this.http.post(url, messageData);
  };

  //add a new member to current guild using player (player to be added) id - used as part of request acceptance process by guild leaders
  addMember(id: number): Observable<any> {
    let url = this.domain + `/addMember`;
    let memberData = {
      playerID: id,
      guildID: this.currGuild.guild.guildID
    }

    return this.http.post(url, memberData);
  };

  //withdraw from currently affiliated guild using player id- to be used by guild members (not leaders)
  withdrawMember(id: number): Observable<any> {
    let url = this.domain + `/deleteMember`;
    let memberData = {
      playerID: id
    };

    return this.http.post(url, memberData);
  }

  //retrieve currently affiliated guild information using player id
  retrieveGuild(id: number): Observable<any> {
    let url = this.domain + `/getGuild`;
    let playerData = {
      playerID: id
    };

    return this.http.post(url, playerData);

  };

  //retrieve the information on all players currently affiliated with current guild - to be used by guild members and leaders
  retrieveMembers(id: number): Observable<any> {
    let url = this.domain + `/getMembers`;
    let playerData = {
      playerID: id
    };

    return this.http.post(url, playerData);
  };

  //update current guild object instance and determine if current user is guild leader
  updateGuild(currData: GuildResponse, id: number) {

    this.currGuild = currData;

    if (this.currGuild.leader.playerID == id) {
      this.isLeader = true;
    } else {
      this.isLeader = false;
    };
    console.log("Curr Guild Data vvvv + is leader?" + this.isLeader)
    console.log(this.currGuild);
  };
  
  betterUpdateGuild(id: number) {

    let url = this.domain + `/getGuild`; 
    let playerData = {
      playerID: id
    };

    this.http.post<ServerResponse>(url, playerData)
      .subscribe(response => {
        if (response.status == 200 && typeof response.data === "object") {
          this.updateGuild(response.data, id);
          console.log("guild updated");
          console.log("Curr Guild Data vvvv + is leader?" + this.isLeader)
          console.log(this.currGuild);

        } else if (response.status == 200 && typeof response.data !== "object") {
          console.log("invalid response type");
        } else {
          console.log(response.error);
        }
      })
  }

  //search for a list of guilds that match a user-submitted term - to be used by non-affiliated players
  searchGuilds(id:number, term: string): Observable<any> {
    let url =  this.domain + `/searchGuilds`;
    let searchData = {
      searchTerm: term 
    };

    return this.http.post(url, searchData);
  }
}
