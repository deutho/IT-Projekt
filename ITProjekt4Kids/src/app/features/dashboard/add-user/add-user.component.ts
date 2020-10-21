import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {AngularFireAuth} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';


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
  constructor(private fb: FormBuilder, private auth: AngularFireAuth, private router: Router) { }

  ngOnInit(): void {
    this.adduserform = this.fb.group({
      firstname:  ['', Validators.required],
      lastname:  ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: ['', Validators.required]
    });
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

      await this.auth.createUserWithEmailAndPassword(username, password).catch( (error) => {
        // registration failed
        console.log(error.code + " \n\n" + error.message);
        this.success = false;
        this.errorMessage = error.message;
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