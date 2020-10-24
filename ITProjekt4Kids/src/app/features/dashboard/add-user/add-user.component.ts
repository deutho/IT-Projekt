import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {AngularFireAuth} from '@angular/fire/auth';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import { User } from 'src/app/models/users.model';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {

  adduserform: FormGroup;
  formSubmitted = false;
  success;
  response;
  errorMessage = '';
  firebaseErrors;
  newUser: User;
  constructor(private fb: FormBuilder, private router: Router, private afs: FirestoreDataService, private auth: AngularFireAuth, private auth_service: AuthService) { }

  ngOnInit(): void {
    this.adduserform = this.fb.group({
      firstname:  ['', Validators.required],
      lastname:  ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: ['', Validators.required]
    });

    this.firebaseErrors = {
      'auth/user-not-found': 'Kein Account mit diesem Benutzernamen gefunden.',
      'auth/email-already-in-use': 'Dieser Benutzername wird bereits von einem anderen Nutzer verwendet.',
      'auth/invalid-email':	'Der angegebene Wert des Benutzernamens ist falsch - Symbole wie "@" dürfen nicht enthalten sein.',
      'auth/invalid-password':	'Der angegebene Wert für das Password ist ungültig. Es muss eine Zeichenfolge mit mindestens sechs Zeichen sein.',
      'auth/weak-password': 'Das Passwort muss mindestens 6 Zeichen lang sein.'
    }; // list of firebase error codes to alternate error messages
  }



  public async onSubmit() {   
    this.success = undefined; 
    this.formSubmitted = true;

    if (this.adduserform.valid) {
      let firstname :string = this.adduserform.get('firstname').value
      let lastname :string = this.adduserform.get('lastname').value
      let username :string = this.adduserform.get('username').value
      let password :string = this.adduserform.get('password').value
      let role :string = this.adduserform.get('role').value
      username = username + '@derdiedaz.at'

      this.newUser = new User("", username, firstname,lastname,1, 1) 

      //secondary App to Create User Without Logging out the current one
      var secondaryApp = this.auth_service.GetSecondaryFirebaseApp();

      await secondaryApp.auth().createUserWithEmailAndPassword(username, password).then(firebaseUser =>{
        this.newUser.uid = firebaseUser.user.uid;
        this.afs.addUser(this.newUser);
        secondaryApp.auth().signOut(); //Maybe not necessary - just for safety
      }).catch( (error) => {
        // registration failed 
        console.log(error.code + " \n\n" + error.message);
        this.success = false;
        this.errorMessage = this.firebaseErrors[error.code] || error.message;
      })
      
      if(this.success == true || this.success == undefined) {
        //successfull registered
        this.adduserform.get('firstname').setValue('')
        this.adduserform.get('lastname').setValue('')
        this.adduserform.get('username').setValue('')
        this.adduserform.get('password').setValue('')
        this.adduserform.get('role').setValue('')
        this.formSubmitted = false;
        this.success = true;
      }
       
    }
  }
  username = ''
  password = ''
  public generateUsernameAndPasswort() {
    if((this.adduserform.get('firstname').value.length >= 3) && (this.adduserform.get('lastname').value.length >= 3)) {
      this.username = this.adduserform.get('firstname').value.substring(0,3).toLowerCase() + this.adduserform.get('lastname').value.substring(0,3).toLowerCase();
      this.password = this.username
      this.adduserform.patchValue({
        username: this.username,
        password: this.password
      })
    }
  }

}