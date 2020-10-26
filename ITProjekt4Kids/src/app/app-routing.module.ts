import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './features/dashboard/main/main.component';
import { LoginPageComponent } from './features/login/login-page.component';
import {AngularFireAuthGuard, AngularFireAuthGuardModule, redirectUnauthorizedTo} from '@angular/fire/auth-guard';
import { VocabularyGameComponent } from '../app/features/games/vocabulary-game/vocabulary-game.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);


const routes: Routes = [
  { path: 'login',
  component: LoginPageComponent
},
  { path: '',
  component: MainComponent,
  canActivate: [AngularFireAuthGuard], 
  data: {authGuardPipe: redirectUnauthorizedToLogin}
},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
