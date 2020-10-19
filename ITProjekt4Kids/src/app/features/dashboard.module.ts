import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';


@NgModule({
declarations: [DashboardComponent],
imports: [
  CommonModule,
  RouterModule,
  ReactiveFormsModule,
  FormsModule,
],
exports: [DashboardComponent]
})
export class DashboardModule { }