import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as firebase from 'firebase';
import { Router } from '@angular/router';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import { AuthService } from 'src/app/services/auth.service';
import { AppService } from 'src/app/services/app.service';



@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

loginform: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private auth: AuthService, private app: AppService, private afs: FirestoreDataService) { }

  errorMessage = '';
  error;
  firebaseErrors;

  ngOnInit(): void {
    firebase.auth().signOut(); //use the firebase auth here and not the service, so there is not redirect
    this.loginform = this.fb.group({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });

    this.firebaseErrors = {
      'auth/user-not-found': 'Kein Account mit diesem Benutzernamen gefunden.',
      'auth/wrong-password': 'Das eingegebene Passwort ist nicht richtig.',
      'auth/everything-else':	'Ups, da hat was nicht funktionert. Überprüfe bitte deine Internetverbindung und versuche es erneut',
    }; // list of firebase error codes to alternate error messages
  }
    
  public async onSubmit() {
    this.error = undefined;
    let username :string = this.loginform.get('username').value
    let password :string = this.loginform.get('password').value
    username = username+'@derdiedaz.at'
    this.auth.signIn(username, password).catch((error) => {
      this.error = true;
      this.loginform.get("username").setValue('');
      this.loginform.get("password").setValue('');
      this.errorMessage = this.firebaseErrors[error.code] || this.firebaseErrors['auth/everything-else'];
    })
  
  }
}