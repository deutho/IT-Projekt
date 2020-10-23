import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';


@Injectable({ providedIn: 'root' })
export class AuthService {

    constructor(
        private auth: AngularFireAuth,
        private router: Router,
    ) {}

    signOut() {
        firebase.auth().signOut().then(() => this.router.navigate(['login']));   
    }

    getCurrentUser(): firebase.User {
        return firebase.auth().currentUser;
    }

    
}
