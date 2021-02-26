import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainMenuComponent } from './features/dashboard/main-menu/main-menu.component';
import { LoginPageComponent } from './features/login/login-page.component';
import { ProfileComponent } from './features/dashboard/profile/profile.component';
import { AddUserComponent } from './features/dashboard/add-user/add-user.component';
import { StatisticsComponent } from './features/dashboard/statistics/statistics.component';
import { BugReportComponent } from './features/dashboard/bug-report/bug-report.component';
import { VocabularyGameComponent } from './features/games/vocabulary-game/vocabulary-game.component';
import { VocabularyGameEditComponent } from './features/games/vocabulary-game-edit/vocabulary-game-edit.component';
import { PersonalFormsGameComponent } from './features/games/personal-forms-game/personal-forms-game.component';
import { PersonalFormsGameEditComponent } from './features/games/personal-forms-game-edit/personal-forms-game-edit.component';
import { VerbPositionGameComponent } from './features/games/verb-position-game/verb-position-game.component';
import { VerbPositionGameEditComponent } from './features/games/verb-position-game-edit/verb-position-game-edit.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { AccessDeniedComponent } from './features/access-denied/access-denied.component';
import { GameRedirectComponent } from './features/games/game-redirect/game-redirect.component';
import { AuthGuard } from './services/AuthGuard';
import { StudentlistComponent } from './features/dashboard/studentlist/studentlist.component';
import { PasswordChangeComponent } from './features/dashboard/profile/password-change/password-change.component';


const routes: Routes = [
  { path: '', redirectTo: ' ', pathMatch: 'full'
}, 
  { path: 'login',
  component: LoginPageComponent
},

  { path: "profile",
  component: ProfileComponent,
  canActivate: [AuthGuard]
},
  { path: "profile/change-password",
  component: PasswordChangeComponent,
  canActivate: [AuthGuard]
},
  { path: "add-user", 
  component: AddUserComponent,
  canActivate: [AuthGuard]
},

{ path: "studentlist", 
  component: StudentlistComponent,
  canActivate: [AuthGuard]
},

  { path: "statistics",
  component: StatisticsComponent,
  canActivate: [AuthGuard]
},

  { path: "bug-report",
  component: BugReportComponent,
  canActivate: [AuthGuard]
},

  { path: "notfound",
  component: NotFoundComponent,
  canActivate: [AuthGuard]
},

  { path: "access-denied",
  component: AccessDeniedComponent,
  canActivate: [AuthGuard]
},

  { path: ':id',
  component: MainMenuComponent,
  canActivate: [AuthGuard]
},

  { path: 'game/:id',
  component: GameRedirectComponent,
  canActivate: [AuthGuard]
},

  { path: "game/vocabular-game/:id",
  component: VocabularyGameComponent,
  canActivate: [AuthGuard]

},
  { path: "game/vocabular-game-edit/:id",
  component: VocabularyGameEditComponent,
  canActivate: [AuthGuard]
},

  { path: "game/personal-forms-game/:id",
  component: PersonalFormsGameComponent,
  canActivate: [AuthGuard]

},
  { path: "game/personal-forms-game-edit/:id",
  component: PersonalFormsGameEditComponent,
  canActivate: [AuthGuard]
},

  { path: "game/verb-position-game/:id",
  component: VerbPositionGameComponent,
  canActivate: [AuthGuard]

},
  { path: "game/verb-position-game-edit/:id",
  component: VerbPositionGameEditComponent,
  canActivate: [AuthGuard]
},

  { path: "**",
  component: NotFoundComponent,
  canActivate: [AuthGuard]
},


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
