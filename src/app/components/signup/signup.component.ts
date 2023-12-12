import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlayerDataService } from '../../services/player-data.service';
import { GuildDataService } from '../../services/guild-data.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  email: string;
  pass: string;
  passConfirm: string;
  phoneNum: string;
  username: string;
  form: FormGroup;
  submitted: boolean;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private playerData: PlayerDataService,
    private guildData: GuildDataService
  ) {
    this.email = "";
    this.pass = "";
    this.passConfirm = "";
    this.phoneNum = "";
    this.username = "";
    this.form = new FormGroup({
      email: new FormControl(''),
      pass: new FormControl(''),
      passConfirm: new FormControl(''),
      username: new FormControl(''),
      phoneNum: new FormControl('')
    })
    this.submitted = false;
  };

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.maxLength(255), Validators.email]],
      pass: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(32)]],
      passConfirm: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.maxLength(16), Validators.minLength(1)]],
      phoneNum: ['', [Validators.required]]
    })
  };

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  register() {

    this.submitted = true;
    if (this.form.invalid) {
      return;
    };

    this.playerData.logout();
    this.guildData.guildReset();

    let newData = {
      email: this.email,
      password: this.pass,
      username: this.username,
      phoneNum: this.phoneNum
    };

    let newDataString = JSON.stringify(newData);
    this.playerData.createUser(newDataString)
    .subscribe(response => {
      if (response.status == 200) {
        this.router.navigateByUrl("/login");

      } else {
        console.log("response error: ");
        console.log(response.error);
      }
    })
  }

}
