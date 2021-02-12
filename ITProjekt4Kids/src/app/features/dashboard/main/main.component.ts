import { Component, OnDestroy, OnInit, SystemJsNgModuleLoader } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { take } from 'rxjs/internal/operators/take';
import { User } from 'src/app/models/users.model';
import { AppService } from 'src/app/services/app.service';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  public header: string;
  public currentUser: User;

  studentMode;
  changedToStudent = false;
  changedToTeacher = false;
  isDeployment;
  private headersubscription;
  private modesubscription;
  private usersubscription;
  constructor(private auth: AuthService, private router: Router, private appService: AppService, private afs: FirestoreDataService) {
    this.headersubscription = this.appService.getMyHeader().subscribe((header) => {
      this.header = header;
   });
   this.modesubscription = this.appService.myStudentMode$.subscribe((studentMode) => {
    this.studentMode = studentMode;
  });
    this.usersubscription = this.appService.getMyUser().subscribe((user) => {
      this.currentUser = user;
    })

  }
  

  async ngOnInit() {
    this.isDeployment = environment.isDeployment;
  }
  
  logout() {
    this.auth.signOut();
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

  navigate(route: string, header: string) {
    this.router.navigate([route]);
    this.appService.myHeader(header);
  }


} 

