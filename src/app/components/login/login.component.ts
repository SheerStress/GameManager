import { Component, Renderer2, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SqlValidator } from '../../validators/sql.validators';
import { Router } from '@angular/router';
import { PlayerDataService } from '../../services/player-data.service';
import { JwtPayload, jwtDecode } from "jwt-decode";
import { GuildDataService } from '../../services/guild-data.service';
import { ItemDataService } from '../../services/item-data.service';

export interface loginPayload {
  id: number,
  email: string,
  phoneNum: string,
  language: string
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  email: string;
  pass: string;
  submitted: boolean;
  responseError: boolean;
  form: FormGroup;

  constructor (

    private playerdata: PlayerDataService,
    private guildData: GuildDataService,
    private itemData: ItemDataService,
    private renderer: Renderer2,
    private router: Router,
    private formBuilder: FormBuilder

  ) {

    this.email = "";
    this.pass = "";
    this.submitted = false;
    this.responseError = false;

    //initialize form for login submission
    this.form = new FormGroup({
      email: new FormControl(''),
      pass: new FormControl('')
    });

  };

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.maxLength(255), Validators.email]], //user must submit email, which should not be longer than 255 characters
      pass: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(32)]] //user must submit email, which should be between 6-32 characters (technically 8 is min, but 6 for testing)
    })

    //make sure all data is reset
    this.playerdata.logout();
    this.guildData.guildReset();
    this.itemData.resetCart();
    this.itemData.resetInventory();
  };

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  //user login function
  login() {

    //reset error state and enter submitted state
    this.responseError = false;
    this.submitted = true;

    //do not send http if form has issues
    if (this.form.invalid) {
      console.log("Invalid form");
      return;
    };

    try {
      //check if user exists in db based on email/pass
      
      this.playerdata.verifyUser(this.email, this.pass)
        .subscribe(response => {
          

          if (response.data) {
            //set new jwt token to local storage for future use
            localStorage.setItem("gameAppToken", response.data.token);
            //logic to decode token and get userID

            //get user data from token payload
            let data = jwtDecode<loginPayload>(response.data.token);
            
            //get player data using user data
            this.playerdata.retrievePlayer(data.id).subscribe(response => {
              if (response.status == 200) {

                console.log(response.data);
                //function to set data to service
                this.playerdata.updatePlayer(response.data);

                //update login state for check by routing guards
                this.playerdata.setLogin();

                //redirect to main page
                this.router.navigateByUrl('/main');
              } else {
                this.responseError = true;
                console.log(response.error);
              };
            });

          } else {
            this.playerdata.logout();
            this.guildData.guildReset();
            this.itemData.resetCart();
            this.itemData.resetInventory();

            this.responseError = true;
            console.log(response.error);
          }
        })

    } catch (error) {
      this.responseError = true;
      console.log(error);
      return;
    };
    
  }

}
