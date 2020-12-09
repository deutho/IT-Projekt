import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { take } from 'rxjs/internal/operators/take';
import { User } from 'src/app/models/users.model';
import { AppService } from 'src/app/services/app.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  public data: string = "mainMenu";
  public header: string = "Startseite";
  public currentUser: User;
  studentMode;
  changedToStudent = false;
  changedToTeacher = false;
  constructor(private auth: AngularFireAuth, private router: Router, private appService: AppService, private afs: FirestoreDataService, private nav: NavigationService) {
    this.appService.myComponent(this.data);
    this.appService.myheader$.subscribe((header) => {
      this.header = header;
   });
   this.appService.myStudentMode$.subscribe((studentMode) => {
    this.studentMode = studentMode;
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

  navigate(header, data) {
    this.nav.navigate(header, data);
  }

  toggleStudentMode() {
    this.appService.myStudentMode();
    if(this.studentMode == false) {
      this.changedToStudent = true;
      this.changedToTeacher = false;
      setTimeout(() => this.changedToStudent = false, 4000);
    }
    else {
      this.changedToStudent = false;
      this.changedToTeacher = true;
      setTimeout(() => this.changedToTeacher = false, 4000);
    }
  }

} 

