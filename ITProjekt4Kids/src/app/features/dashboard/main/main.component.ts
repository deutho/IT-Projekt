import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AppService } from 'src/app/services/app.service';
import { DashboardService } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  public data: string = "mainMenu";
  constructor(private auth: AngularFireAuth, private router: Router, private appService: AppService, private dashboardService: DashboardService) {
    this.appService.myComponent(this.data);
   }

  ngOnInit(): void {
  }


  logout() {
    this.auth.signOut().then(() => this.router.navigate(['login']))
  }

  profile() {
    this.data = "profile";
    this.appService.myComponent(this.data);
    this.dashboardService.changes();
  }

  addUser() {
    this.data = "addUser";
    this.appService.myComponent(this.data);
    this.dashboardService.changes();
  }

  statistics() {
    this.data = "statistics";
    this.appService.myComponent(this.data);
    this.dashboardService.changes();
  }

  mainMenu() {
    this.data = "mainMenu";
    this.appService.myComponent(this.data);
    this.dashboardService.changes();
  }
} 

