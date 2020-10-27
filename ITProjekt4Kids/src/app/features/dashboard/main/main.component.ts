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

  public data: string = "loading";
  public header: string = "";
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
    
    if (this.currentUser.role == 1) this.navigate("Lehreraccounts", "statistics");
    else this.navigate("Hauptmenü", "mainMenu");
    
  }
  
  logout() {
    this.auth.signOut().then(() => this.router.navigate(['login']))
  }

  navigate(header, data) {
    this.data = data;
    this.appService.myComponent(this.data);
    this.dashboardService.changes();
    this.header = header;
  }


} 

