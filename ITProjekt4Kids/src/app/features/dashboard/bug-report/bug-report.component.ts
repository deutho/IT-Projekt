import { createUrlResolverWithoutPackagePrefix, ThrowStmt } from '@angular/compiler';
import { HostListener } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { AngularFirestoreCollection } from '@angular/fire/firestore';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import { BugReport } from 'src/app/models/bugreport.model';
import { User } from 'src/app/models/users.model';
import { AppService } from 'src/app/services/app.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';

@Component({
  selector: 'app-bug-report',
  templateUrl: './bug-report.component.html',
  styleUrls: ['./bug-report.component.css']
})
export class BugReportComponent implements OnInit {

  response;
  success;
  posted;
  currentUser: User;
  write;
  bugreports: BugReport[];
  ids: String[] = [];
  dates: String[] = [];

  constructor(private afs: FirestoreDataService, private app: AppService) { }

  async ngOnInit() {
    this.write = true;
    this.posted = false;
    await this.afs.getCurrentUser().then(data => this.currentUser = data[0]);    

    this.app.myHeader("Feedback geben");
    
  } 

  public async onSubmit() {
    let user = this.currentUser.firstname + " " + this.currentUser.lastname;
    let description = (<HTMLInputElement>document.getElementById("textarea")).value;
    let status = "offen";

    if (description != "") {
      this.success = this.afs.addBugReport(description, user, status);
      if (this.success == true) {
        this.response = "Bug Report erfolgreich abgesendet. Danke.";
        (<HTMLInputElement>document.getElementById("textarea")).value = "";
        this.posted = true;
      }
      else "Da hat was nicht funktioniert, versuchen Sie es bitte noch einmal"
      }
    }

  changeView() {
    this.write = !this.write;
    if(!this.write) this.getReportsOfUser();
  }

  async getReportsOfUser() {
    console.log(this.currentUser.firstname+" "+this.currentUser.lastname);

    await this.afs.getBugReportsByUser(this.currentUser.firstname+" "+this.currentUser.lastname).valueChanges().pipe(take(1)).toPromise().
      then(data => {
        this.bugreports =  data;
      });

    this.bugreports = this.bugreports.sort((n1, n2) => {return n2.time.seconds - n1.time.seconds });
    let i = 0;
    this.bugreports.forEach((m) => {
      var date = new Date(m.time.seconds*1000).toLocaleDateString("de-DE")
      this.dates[i] = date;
      i++;
    });
  }


  
}


