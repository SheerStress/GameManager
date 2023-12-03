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

    this.form = new FormGroup({
      email: new FormControl(''),
      pass: new FormControl('')
    });

  };

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.maxLength(255), Validators.email]],
      pass: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(32)]]
    })

    this.playerdata.logout();
    this.guildData.guildReset();
    this.itemData.resetCart();
    this.itemData.resetInventory();
  };

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  login() {

    this.responseError = false;
    this.submitted = true;

    if (this.form.invalid) {
      console.log("Invalid form");
      return;
    };

    try {

      console.log("Email: " + this.email + "| Pass: " + this.pass);
      this.playerdata.verifyUser(this.email, this.pass)
        .subscribe(response => {
          console.log(response.data);

          if (response.data) {
            localStorage.setItem("gameAppToken", response.data.token);
            //logic to decode token and get userID
            console.log("JWT payload")
            console.log(jwtDecode(response.data.token));
            let data = jwtDecode<loginPayload>(response.data.token);
            console.log(data.id);

            this.playerdata.retrievePlayer(data.id).subscribe(response => {
              if (response.status == 200) {

                console.log(response.data);
                //function to set data to service
                this.playerdata.updatePlayer(response.data);
                this.playerdata.setLogin();
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
    //move subscription to service - return payload?
  }

}
