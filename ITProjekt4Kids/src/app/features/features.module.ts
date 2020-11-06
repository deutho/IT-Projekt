import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MainComponent } from './dashboard/main/main.component';
import { ProfileComponent } from './dashboard/profile/profile.component';
import { StatisticsComponent } from './dashboard/statistics/statistics.component';
import { AddUserComponent } from './dashboard/add-user/add-user.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardHostDirective } from 'src/app/directives/dashboard-host.directive';
import { MainMenuComponent } from './dashboard/main-menu/main-menu.component';
import { AddTaskComponent } from './dashboard/add-task/add-task.component';
import { VocabularyGameComponent } from './games/vocabulary-game/vocabulary-game.component';
import { VocabularyGameEditComponent } from './games/vocabulary-game-edit/vocabulary-game-edit.component';
import { PersonalFormsGameComponent } from './games/personal-forms-game/personal-forms-game.component';
import { PersonalFormsGameEditComponent } from './games/personal-forms-game-edit/personal-forms-game-edit.component';



@NgModule({
declarations: [MainComponent, ProfileComponent, StatisticsComponent, AddUserComponent, DashboardComponent, DashboardHostDirective, MainMenuComponent, AddTaskComponent, VocabularyGameComponent, VocabularyGameEditComponent,
PersonalFormsGameComponent, PersonalFormsGameEditComponent],
imports: [
  CommonModule,
  RouterModule,
  ReactiveFormsModule,
  FormsModule,
],
exports: [MainComponent]
})
export class FeaturesModule { }
