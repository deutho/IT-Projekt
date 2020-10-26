import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { take } from 'rxjs/internal/operators/take';
import { User } from 'src/app/models/users.model';
import { AppService } from 'src/app/services/app.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  public data: string = "mainMenu";
  public header: string = "Hauptmenü"
  public currentUser: User;
  constructor(private auth: AngularFireAuth, private router: Router, private appService: AppService, private dashboardService: DashboardService, private afs: FirestoreDataService) {
    this.appService.myComponent(this.data);

    this.appService.myheader$.subscribe((header) => {
      this.header = header;
   });
  }

  async ngOnInit() {
    await this.afs.getCurrentUser().valueChanges().pipe(take(1)).toPromise().
    then(data => this.currentUser = data[0]);
    this.currentUser.username = this.currentUser.username.substring(0, this.currentUser.username.lastIndexOf('@'));
    
  }
  
  logout() {
    this.auth.signOut().then(() => this.router.navigate(['login']))
  }

  profile() {
    this.data = "profile";
    this.appService.myComponent(this.data);
    this.dashboardService.changes();
    this.header = "Profil"
  }

  addUser() {
    this.data = "addUser";
    this.appService.myComponent(this.data);
    this.dashboardService.changes();
    this.header = "Benutzer hinzufügen"
  }

  addTask() {
    this.data = "addTask";
    this.appService.myComponent(this.data);
    this.dashboardService.changes();
    this.header = "Aufgabe hinzufügen"
  }


  statistics() {
    this.data = "statistics";
    this.appService.myComponent(this.data);
    this.dashboardService.changes();
    this.header = "Statistik"
  }

  mainMenu() {
    this.data = "mainMenu";
    this.appService.myComponent(this.data);
    this.dashboardService.changes();
    this.header = "Hauptmenü"
  }


} 

