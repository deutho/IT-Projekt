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
import { VocabularyGameComponent } from './features/games/vocabulary-game/vocabulary-game.component';
import { VocabularyGameEditComponent } from './features/games/vocabulary-game-edit/vocabulary-game-edit.component';
import { PersonalFormsGameComponent } from './features/games/personal-forms-game/personal-forms-game.component';
import { PersonalFormsGameEditComponent } from './features/games/personal-forms-game-edit/personal-forms-game-edit.component';
import { VerbPositionGame } from './models/VerbPositionGame.model';
import { VerbPositionGameComponent } from './features/games/verb-position-game/verb-position-game.component';
import { VerbPositionGameEditComponent } from './features/games/verb-position-game-edit/verb-position-game-edit.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);


const routes: Routes = [
  { path: 'login',
  component: LoginPageComponent
},
  { path: 'direct',
  component: RedirectComponent
},
  { path: 'app/:id',
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
  { path: "app/vocabular-game",
  component: VocabularyGameComponent,
  canActivate: [AngularFireAuthGuard], 
  data: {authGuardPipe: redirectUnauthorizedToLogin}

},
  { path: "app/vocabular-game-edit",
  component: VocabularyGameEditComponent,
  canActivate: [AngularFireAuthGuard], 
  data: {authGuardPipe: redirectUnauthorizedToLogin}
},

  { path: "app/personal-forms-game",
  component: PersonalFormsGameComponent,
  canActivate: [AngularFireAuthGuard], 
  data: {authGuardPipe: redirectUnauthorizedToLogin}

},
  { path: "app/personal-forms-game-edit",
  component: PersonalFormsGameEditComponent,
  canActivate: [AngularFireAuthGuard], 
  data: {authGuardPipe: redirectUnauthorizedToLogin}
},

  { path: "app/verb-position-game",
  component: VerbPositionGameComponent,
  canActivate: [AngularFireAuthGuard], 
  data: {authGuardPipe: redirectUnauthorizedToLogin}

},
  { path: "app/verb-position-game-edit",
  component: VerbPositionGameEditComponent,
  canActivate: [AngularFireAuthGuard], 
  data: {authGuardPipe: redirectUnauthorizedToLogin}
},

  { path: "**",
  redirectTo: 'app/ ', //Hier vielleicht noch 404 Page not Found?
},


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
