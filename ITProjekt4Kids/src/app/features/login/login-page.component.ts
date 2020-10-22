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

  constructor(private fb: FormBuilder, private router: Router, public auth: AuthService) { }
  


  errorMessage = '';
  error = undefined;

  ngOnInit(): void {
    this.loginform = this.fb.group({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  public onSubmit() {
    this.error = false;
    let username :string = this.loginform.get('username').value
    let password :string = this.loginform.get('password').value
    this.auth.signIn(username, password).then(() => this.router.navigate([''])).catch(function(error) {
      console.log(error.code + " " + error.message);
      this.error = true;
      if(error.code == "auth/user-not-found") {
         this.errorMessage = "Dieser Benutzername existiert nicht";
      }
      else if (error.code == "auth/wrong-password"){
        this.errorMessage = "Das Passwort ist falsch";
      }
      else  this.errorMessage = "Ups, da hat was nicht funktionert. Überprüfe bitte deine Internetverbindung";
    })
  }

}