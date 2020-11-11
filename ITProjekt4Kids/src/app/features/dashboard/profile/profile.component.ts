import { Component, OnInit } from '@angular/core';
import { take, tap } from 'rxjs/operators';
import { User } from 'src/app/models/users.model';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  currentUser: User;
  accountTyp: String;
  error; 
  
  constructor(public afs: FirestoreDataService, public auth: AuthService) {}
  
  async ngOnInit() {
    await this.afs.getCurrentUser().valueChanges().pipe(take(1)).toPromise().
    then(data => this.currentUser = data[0]);
    this.currentUser.username = this.currentUser.username.substring(0, this.currentUser.username.lastIndexOf('@'));

    if(this.currentUser.role == 1) this.accountTyp = "Adminaccount";
    else if(this.currentUser.role == 2) this.accountTyp = "Lehreraccount";
    else if (this.currentUser.role == 3) this.accountTyp = "Schüler";
  }

  changePassword(currentPassword, newPassword) {
  this.auth.changePassword(currentPassword, newPassword).catch((error) => {
      this.error = error;
  });
    
  }


   
}
