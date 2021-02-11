import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainMenuComponent } from './features/dashboard/main-menu/main-menu.component';
import { LoginPageComponent } from './features/login/login-page.component';
import {AngularFireAuthGuard, AngularFireAuthGuardModule, redirectUnauthorizedTo} from '@angular/fire/auth-guard';
import { RedirectComponent } from './features/redirect/redirect.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);


const routes: Routes = [
  { path: 'login',
  component: LoginPageComponent
},
{ path: 'direct',
  component: RedirectComponent
},
  { path: 'app',
  component: MainMenuComponent,
  canActivate: [AngularFireAuthGuard], 
  data: {authGuardPipe: redirectUnauthorizedToLogin}
},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
