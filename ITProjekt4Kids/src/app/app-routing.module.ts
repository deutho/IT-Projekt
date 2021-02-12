import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainMenuComponent } from './features/dashboard/main-menu/main-menu.component';
import { LoginPageComponent } from './features/login/login-page.component';
import {AngularFireAuthGuard, AngularFireAuthGuardModule, redirectUnauthorizedTo} from '@angular/fire/auth-guard';
import { RedirectComponent } from './features/redirect/redirect.component';
import { ProfileComponent } from './features/dashboard/profile/profile.component';
import { AddUserComponent } from './features/dashboard/add-user/add-user.component';
import { StatisticsComponent } from './features/dashboard/statistics/statistics.component';
import { combineAll } from 'rxjs/operators';
import { BugReportComponent } from './features/dashboard/bug-report/bug-report.component';

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
  { path: "app/profile",
  component: ProfileComponent,
  canActivate: [AngularFireAuthGuard], 
  data: {authGuardPipe: redirectUnauthorizedToLogin}
},

  { path: "app/add-user", 
  component: AddUserComponent,
  canActivate: [AngularFireAuthGuard], 
  data: {authGuardPipe: redirectUnauthorizedToLogin}
},

  { path: "app/statistics",
  component: StatisticsComponent,
  canActivate: [AngularFireAuthGuard], 
  data: {authGuardPipe: redirectUnauthorizedToLogin}
},

  { path: "app/bug-report",
  component: BugReportComponent,
  canActivate: [AngularFireAuthGuard], 
  data: {authGuardPipe: redirectUnauthorizedToLogin}
},

  { path: "**",
  redirectTo: "app",
},


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
