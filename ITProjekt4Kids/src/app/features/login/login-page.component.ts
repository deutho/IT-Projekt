import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {AngularFireAuth} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

loginform: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, public auth: AuthService, private fireauth: AngularFireAuth) { }
  


  errorMessage = '';
  error;
  firebaseErrors;

  ngOnInit(): void {
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
    this.fireauth.signInWithEmailAndPassword(username, password).then(() => this.router.navigate([''])).catch((error) => {
      this.error = true;
      this.loginform.get("username").setValue('');
      this.loginform.get("password").setValue('');
      this.errorMessage = this.firebaseErrors[error.code] || this.firebaseErrors['auth/everything-else'];
    })
  
  }
}