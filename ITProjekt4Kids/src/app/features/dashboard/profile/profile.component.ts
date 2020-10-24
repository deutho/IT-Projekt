import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs/operators';
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
    this.getCurrentUser();
    
  }
   
  getCurrentUser() {
    this.afs.getCurrentUser().valueChanges().subscribe(data => {
      data[0].username = data[0].username.substring(0, data[0].username.lastIndexOf('@'));
      this.currentUser = data[0];
    });
  }

}
