import { NgModule } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginPageComponent } from './features/login/login-page.component';
import {AngularFireAuthGuard, redirectUnauthorizedTo} from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);


const routes: Routes = [
  { path: 'login',
  component: LoginPageComponent
},
  { path: '',
  component: DashboardComponent,
  canActivate: [AngularFireAuthGuard], 
  data: {authGuardPipe: redirectUnauthorizedToLogin}
},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
