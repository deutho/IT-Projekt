import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { take, tap } from 'rxjs/operators';
import { User } from 'src/app/models/users.model';
import { AppService } from 'src/app/services/app.service';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import {MainComponent} from '../main/main.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  passwordChangeForm: FormGroup;

  currentUser: User;
  accountTyp: String;
  error;
  errorMessage;
  passwordChange = undefined;
  
  
  constructor(public afs: FirestoreDataService, public auth: AuthService, private fb: FormBuilder, private app: AppService) {
    
  }
  
  async ngOnInit() {
  
    await this.afs.getCurrentUser().then(data => this.currentUser = data[0]);
    this.currentUser.username = this.currentUser.username.substring(0, this.currentUser.username.lastIndexOf('@'));

    if(this.currentUser.role == 1) this.accountTyp = "Adminaccount";
    else if(this.currentUser.role == 2) this.accountTyp = "Lehreraccount";
    else if (this.currentUser.role == 3) this.accountTyp = "Schüler";

    this.passwordChangeForm = this.fb.group({
      oldPassword: new FormControl('', Validators.required),
      newPassword: new FormControl('', Validators.required),
      newPasswordConfirm: new FormControl('', Validators.required),
    });
    this.passwordChange = false;


    this.app.myHeader("Profil");

  }

  async changePassword() {
    this.error = undefined
    this.errorMessage = "";
    this.passwordChange = true;
  }

  async onSubmit() {
    let oldPassword :string = this.passwordChangeForm.get('oldPassword').value
    let newPassword :string = this.passwordChangeForm.get('newPassword').value
    let newPasswordConfirm :string = this.passwordChangeForm.get('newPasswordConfirm').value

    if (newPassword === newPasswordConfirm) {
      await this.auth.changePassword(oldPassword, newPassword).catch((error) => {
          this.errorMessage = error;
      });

      if (this.errorMessage === "") {
          this.errorMessage = "Passwort wurde geändert"
          this.error = false;
      } else {
        this.error = true;
      }
    } else {
      this.errorMessage = "Passwort-Bestätigung stimmt nicht überein";
      this.error = true;
    }

    setTimeout(() => this.error = undefined, 4000);

  }


}
