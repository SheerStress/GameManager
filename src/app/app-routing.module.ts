//importing necessary classes for routing functionality
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//importing page components
import { MainpageComponent } from './components/mainpage/mainpage.component';
import { ItemstoreComponent } from './components/itemstore/itemstore.component';
import { GuildComponent } from './components/guild/guild.component';
import { GuildsearchComponent } from './components/guildsearch/guildsearch.component';
import { GuildcreateComponent } from './components/guildcreate/guildcreate.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { SettingsComponent } from './components/settings/settings.component';

//importing route guards to control user page access
import { authGuard } from "./auth/auth.guard";
import { guildGuard } from "./guards/guild.guard";
import { suspensionGuard } from "./guards/suspension.guard";

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'items', component: ItemstoreComponent, canActivate: [authGuard, suspensionGuard] },
  { path: 'guild', component: GuildComponent, canActivate: [authGuard, guildGuard, suspensionGuard] },
  { path: 'gsearch', component: GuildsearchComponent, canActivate: [authGuard, suspensionGuard] },
  { path: 'gcreate', component: GuildcreateComponent, canActivate: [authGuard, suspensionGuard] },
  { path: 'inventory', component: InventoryComponent, canActivate: [authGuard, suspensionGuard] },
  { path: 'main', component: MainpageComponent, canActivate: [authGuard, suspensionGuard] },
  { path: 'signup', component: SignupComponent },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard, suspensionGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
