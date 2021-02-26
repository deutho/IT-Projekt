import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MainComponent } from './dashboard/main/main.component';
import { ProfileComponent } from './dashboard/profile/profile.component';
import { StatisticsComponent } from './dashboard/statistics/statistics.component';
import { AddUserComponent } from './dashboard/add-user/add-user.component';
import { DashboardHostDirective } from 'src/app/directives/dashboard-host.directive';
import { MainMenuComponent } from './dashboard/main-menu/main-menu.component';
import { VocabularyGameComponent } from './games/vocabulary-game/vocabulary-game.component';
import { VocabularyGameEditComponent } from './games/vocabulary-game-edit/vocabulary-game-edit.component';
import { PersonalFormsGameComponent } from './games/personal-forms-game/personal-forms-game.component';
import { PersonalFormsGameEditComponent } from './games/personal-forms-game-edit/personal-forms-game-edit.component';
import { VerbPositionGameComponent } from './games/verb-position-game/verb-position-game.component';
import { VerbPositionGameEditComponent } from './games/verb-position-game-edit/verb-position-game-edit.component';
import { BugReportComponent } from './dashboard/bug-report/bug-report.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { UploaderComponent } from './uploader/uploader.component';
import { UploadTaskComponent } from './upload-task/upload-task.component';
import { DropzoneDirective } from './dropzone.directive';
import { AngularFirestore } from '@angular/fire/firestore';
import { AppComponent } from '../app.component';
import { RedirectComponent } from './redirect/redirect.component';
import { ClipboardModule } from 'ngx-clipboard';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NotFoundComponent } from './not-found/not-found.component';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { GameRedirectComponent } from './games/game-redirect/game-redirect.component';
import { StudentlistComponent } from './dashboard/studentlist/studentlist.component';
import { PasswordChangeComponent } from './dashboard/profile/password-change/password-change.component';




@NgModule({
declarations: [
  ProfileComponent,
  StatisticsComponent,
  AddUserComponent,
  DashboardHostDirective,
  MainMenuComponent,
  VocabularyGameComponent,
  VocabularyGameEditComponent,
  PersonalFormsGameComponent,
  PersonalFormsGameEditComponent,
  VerbPositionGameComponent,
  VerbPositionGameEditComponent,
  BugReportComponent,
  UploaderComponent,
  UploadTaskComponent,
  DropzoneDirective,
  RedirectComponent,
  NotFoundComponent,
  AccessDeniedComponent,
  GameRedirectComponent,
  StudentlistComponent,
  PasswordChangeComponent],
imports: [
  CommonModule,
  RouterModule,
  ReactiveFormsModule,
  FormsModule,
  DragDropModule,
  ClipboardModule,
  NgbModule
],

providers: [AngularFirestore],
bootstrap: [AppComponent]
})
export class FeaturesModule { }
