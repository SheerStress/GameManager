import { User } from "./user";
import { Item } from "./item";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlayerDataService } from '../services/player-data.service';
export class Player extends User{

  playerData = {
    playerID: <number>0,
    username: <string>"",
    inventory: [{
        itemID: <number>0,
        itemName: <string>"",
        quantity: <number>0
      }],
    currentBalance: <number>0,
  }

  //takes data from database (provided through playerDataService) to initialize User (parent class)/Player data
  constructor(private retrievedData: string, private dataservice: PlayerDataService) {
    super(dataservice);
    this.playerData = JSON.parse(retrievedData);
  }

  orderItem() {

  }

  createGuild() {

  }

  joinGuild() {

  }

  leaveGuild() {

  }

  sendMessage() {

  }

  checkMessages() {

  }

}
