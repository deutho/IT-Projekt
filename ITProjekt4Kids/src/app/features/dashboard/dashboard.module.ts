import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { ProfileComponent } from './profile/profile.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { AddUserComponent } from './add-user/add-user.component';
import { DashboardComponent } from './dashboard.component';
import { DashboardHostDirective } from 'src/app/directives/dashboard-host.directive';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { AddTaskComponent } from './add-task/add-task.component';


@NgModule({
declarations: [MainComponent, ProfileComponent, StatisticsComponent, AddUserComponent, DashboardComponent, DashboardHostDirective, MainMenuComponent, AddTaskComponent],
imports: [
  CommonModule,
  RouterModule,
  ReactiveFormsModule,
  FormsModule,
],
exports: [MainComponent]
})
export class DashboardModule { }
