import { Component, OnInit } from '@angular/core';
import { AngularFirestoreCollection } from '@angular/fire/firestore';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import { User } from 'src/app/models/users.model';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';

@Component({
  selector: 'app-bug-report',
  templateUrl: './bug-report.component.html',
  styleUrls: ['./bug-report.component.css']
})
export class BugReportComponent implements OnInit {

  bugreportform: FormGroup;
  response;
  posted;
  currentUser: User;

  constructor(private fb: FormBuilder, private afs: FirestoreDataService) { }

  async ngOnInit() {
    this.bugreportform = this.fb.group({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });

    await this.afs.getCurrentUser().valueChanges().pipe(take(1)).toPromise().
    then(data => this.currentUser = data[0]);
  } 

  public async onSubmit() {
    let username :string = this.bugreportform.get('username').value
    let password :string = this.bugreportform.get('description').value
    let user = this.currentUser.firstname + " " + this.currentUser.lastname;
    this.response = "Bug-Report erfolgreich abbgesendet";
    this.posted = true;
  }



}
