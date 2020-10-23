import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/users.model';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  currentUser: User;
  
  constructor(public afs: FirestoreDataService) {}
  

  ngOnInit() {

    this.currentUser = this.afs.getCurrentUser();
    this.currentUser.email = this.currentUser.email.substring(0, this.currentUser.email.lastIndexOf('@')) //get the Username without de @derdiedaz.at
    
  }
   

  changeData() {
    //To do
  }
}
