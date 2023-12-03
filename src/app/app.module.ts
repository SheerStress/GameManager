import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from 
    '@angular/platform-browser/animations'; 

import { PlayerDataService } from './services/player-data.service';
import { GuildDataService } from './services/guild-data.service';

import { ItemstoreComponent } from './components/itemstore/itemstore.component';
import { MainpageComponent } from './components/mainpage/mainpage.component';
import { GuildComponent } from './components/guild/guild.component';
import { SignupComponent } from './components/signup/signup.component';
import { GuildsearchComponent } from './components/guildsearch/guildsearch.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LoginComponent } from './components/login/login.component';
import { GuildcreateComponent } from './components/guildcreate/guildcreate.component';

@NgModule({
  declarations: [
    AppComponent,
    ItemstoreComponent,
    MainpageComponent,
    GuildComponent,
    LoginComponent,
    SignupComponent,
    GuildsearchComponent,
    InventoryComponent,
    SettingsComponent,
    GuildcreateComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule
  ],
  providers: [PlayerDataService, GuildDataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
