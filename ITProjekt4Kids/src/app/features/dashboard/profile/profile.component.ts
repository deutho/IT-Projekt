import { Component, OnInit } from '@angular/core';
import { take, tap } from 'rxjs/operators';
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
  
  async ngOnInit() {
    await this.afs.getCurrentUser().valueChanges().pipe(take(1)).toPromise().
    then(data => this.currentUser = data[0]);
    this.currentUser.username = this.currentUser.username.substring(0, this.currentUser.username.lastIndexOf('@'));
  }
   
}
