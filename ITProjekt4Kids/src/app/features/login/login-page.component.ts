import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {AngularFireAuth} from '@angular/fire/auth';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

loginform: FormGroup;

  constructor(private fb: FormBuilder, private auth: AngularFireAuth, private router: Router) { }
  


  errorMessage: string = "";


  ngOnInit(): void {
    this.loginform = this.fb.group({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  public onSubmit() {

    let username :string = this.loginform.get('username').value
    let password :string = this.loginform.get('password').value
    username = username + '@derdiedaz.at'
    this.auth.signInWithEmailAndPassword(username, password).then(() => this.router.navigate([''])).catch(function(error) {
      console.log(error.code + " " + error.message);
      if(error.code == "auth/user-not-found") {
         alert("Dieser Benutzername existiert nicht");
         
      }
      else if (error.code == "auth/wrong-password"){
        alert("Das Passwort ist falsch");
      }
      else  alert("Ups, da hat was nicht funktionert. Überprüfe bitte deine Internetverbindung");
    });
  }

}