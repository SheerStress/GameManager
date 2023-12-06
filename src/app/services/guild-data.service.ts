import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';



export interface GuildResponse {
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
export class GuildDataService {

  currGuild: GuildResponse;
  leaderInfo: GuildLeader;
  isLeader: boolean;

  constructor(private http: HttpClient) {
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

  getData() {
    return this.currGuild;
  }

  createGuild(id: number, name: string, welcome: string, greet: string): Observable<any> {
    let url = `http://localhost:3000/createGuild`;
    let newData = {
      playerID: id,
      guildName: name,
      welcomeMessage: welcome,
      greeting: greet
    };
    return this.http.post(url, newData);
  };

  deleteGuild(): Observable<any> {
    let url = `http://localhost:3000/deleteGuild`;
    let guildData = {
      guildID: this.currGuild.guild.guildID
    };

    return this.http.post(url, guildData);
  };

  guildReset() {
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

  retrieveRequest(id: number): Observable<any> {
    let url = `http://localhost:3000/getRequest`
    let requestData = {
      playerID: id
    };
    return this.http.post(url, requestData);
  }

  retrieveAllRequests(id: number): Observable<any> {
    let url = `http://localhost:3000/getAllRequests`;
    let requestData = {
      playerID: id
    };
    return this.http.post(url, requestData);
  }

  createRequest(id: number, gID: number): Observable<any> {
    let url = `http://localhost:3000/addRequest`;
    let requestData = {
      playerID: id,
      guildID: gID
    };

    return this.http.post(url, requestData);
  };

  rejectRequest(id: number): Observable<any> {
    let url = `http://localhost:3000/rejectRequest`;
    let requestData = {
      playerID: id,
      guildID: this.currGuild.guild.guildID
    };

    return this.http.post(url, requestData);
  };

  withdrawRequest(id: number, gID: number): Observable<any> {
    let url = `http://localhost:3000/deleteRequest`;
    let requestData = {
      playerID: id,
      guildID: gID
    };
    return this.http.post(url, requestData);
  }

  createMessage(id: number, content: string): Observable<any> {
    let url = `http://localhost:3000/addMessage`;
    let messageData = {
      playerID: id,
      messageContent: content
    };

    return this.http.post(url, messageData);
  };

  getMessages(id: number): Observable<any> {
    let url = `http://localhost:3000/getMessages`;
    let messageData = {
      playerID: id
    }

    return this.http.post(url, messageData);
  };

  addMember(id: number): Observable<any> {
    let url = `http://localhost:3000/addMember`;
    let memberData = {
      playerID: id,
      guildID: this.currGuild.guild.guildID
    }

    return this.http.post(url, memberData);
  };

  withdrawMember(id: number): Observable<any> {
    let url = `http://localhost:3000/deleteMember`;
    let memberData = {
      playerID: id
    };

    return this.http.post(url, memberData);
  }

  retrieveGuild(id: number): Observable<any> {
    let url = `http://localhost:3000/getGuild`;
    let playerData = {
      playerID: id
    };

    return this.http.post(url, playerData);

  };

  retrieveMembers(id: number): Observable<any> {
    let url = `http://localhost:3000/getMembers`;
    let playerData = {
      playerID: id
    };

    return this.http.post(url, playerData);
  };

  updateGuild(currData: GuildResponse, id: number) {
    this.currGuild = currData;
    if (this.currGuild.leader.playerID == id) {
      this.isLeader = true;
    };
    console.log("Curr Guild Data vvvv + is leader?" + this.isLeader)
    console.log(this.currGuild);
  };

  betterUpdateGuild(id: number) {
    let url = `http://localhost:3000/getGuild`;
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

  searchGuilds(id:number, term: string): Observable<any> {
    let url =  `http://localhost:3000/searchGuilds`;
    let searchData = {
      searchTerm: term 
    };

    return this.http.post(url, searchData);
  }
}
