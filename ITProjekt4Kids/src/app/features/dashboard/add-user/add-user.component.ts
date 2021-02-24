import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {AngularFireAuth} from '@angular/fire/auth';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import { User } from 'src/app/models/users.model';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import { take } from 'rxjs/operators';
import { HostListener } from '@angular/core';
import { AppService } from 'src/app/services/app.service';


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
  currentUser: User;
  roleAddingUser: Number;
  constructor(private fb: FormBuilder, private afs: FirestoreDataService, private auth_service: AuthService, private app: AppService) { }

  ngOnInit(): void {
    this.adduserform = this.fb.group({
      firstname:  ['', Validators.required],
      lastname:  ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.firebaseErrors = {
      'auth/user-not-found': 'Kein Account mit diesem Benutzernamen gefunden.',
      'auth/email-already-in-use': 'Dieser Benutzername wird bereits von einem anderen Nutzer verwendet.',
      'auth/invalid-email':	'Der angegebene Wert des Benutzernamens ist falsch - Symbole wie "@" dürfen nicht enthalten sein.',
      'auth/invalid-password':	'Der angegebene Wert für das Password ist ungültig. Es muss eine Zeichenfolge mit mindestens sechs Zeichen sein.',
      'auth/weak-password': 'Das Passwort muss mindestens 6 Zeichen lang sein.'
    }; // list of firebase error codes to alternate error messages


    this.app.myHeader("Schüler hinzufügen");
    
  }
  
  public async onSubmit() {   
    this.success = undefined; 
    this.formSubmitted = true;

    await this.afs.getCurrentUser().then(data => this.currentUser = data[0]);

    console.log(this.adduserform.valid);

    if (this.adduserform.valid) {
      let firstname :string = this.adduserform.get('firstname').value
      let lastname :string = this.adduserform.get('lastname').value
      let username :string = this.adduserform.get('username').value
      let password :string = this.adduserform.get('password').value
      username = username + '@derdiedaz.at'

      if (this.currentUser.role == 1){
        var role = 2;
        var classid = "-1";
      } 
      else{
        var role = 3;
        var classid = "1A";
      } 
      this.newUser = new User("", username, firstname,lastname, "1", role, this.currentUser.uid, classid, "Testschule"); 
      
      //secondary App to Create User Without Logging out the current one
      var secondaryApp = this.auth_service.GetSecondaryFirebaseApp();

      await secondaryApp.auth().createUserWithEmailAndPassword(username, password).then(firebaseUser =>{
        this.newUser.uid = firebaseUser.user.uid;
        console.log(this.currentUser);
        console.log(this.newUser);
        this.afs.addUser(this.newUser, this.currentUser);

        secondaryApp.auth().signOut(); //Maybe not necessary - just for safety
      }).catch( (error) => {
        // registration failed 
        console.log(error.code + " \n\n" + error.message);
        this.success = false;
        this.errorMessage = this.firebaseErrors[error.code] || error.message;
      })

      if (this.newUser.role == 2) {
        this.afs.addFolderDocument(this.newUser.uid, 'root');
      }

      //Delete the second App
      secondaryApp.delete();
      
      if(this.success == true || this.success == undefined) {
        //successfull registered
        this.adduserform.get('firstname').setValue('')
        this.adduserform.get('lastname').setValue('')
        this.adduserform.get('username').setValue('')
        this.adduserform.get('password').setValue('')
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