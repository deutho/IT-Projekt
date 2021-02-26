import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/models/users.model';
import { AppService } from 'src/app/services/app.service';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';

@Component({
  selector: 'app-password-change',
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.css']
})
export class PasswordChangeComponent implements OnInit {

  passwordChangeForm: FormGroup;
  currentUser: User;
  errorMessage: string;
  error: boolean;

  constructor(private fb: FormBuilder, private afs: FirestoreDataService, private app: AppService, public auth: AuthService, public router: Router) { }

  async ngOnInit(): Promise<void> {

    this.passwordChangeForm = this.fb.group({
      oldPassword: new FormControl('', Validators.required),
      newPassword: new FormControl('', Validators.required),
      newPasswordConfirm: new FormControl('', Validators.required),
    });

    this.app.myHeader("Passwort ändern");
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
