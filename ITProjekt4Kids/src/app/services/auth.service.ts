import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';
import { environment } from 'src/environments/environment';


@Injectable({ providedIn: 'root' })
export class AuthService {

    constructor(
        private auth: AngularFireAuth,
        private router: Router,
    ) {}

    signOut() {
        firebase.auth().signOut().then(() => this.router.navigate(['login']));   
    }

    signIn(email, password): Promise<firebase.auth.UserCredential> {
        return firebase.auth().signInWithEmailAndPassword(email, password);
    }

    getCurrentUser(): firebase.User {
        return firebase.auth().currentUser;
    }

    GetSecondaryFirebaseApp(): firebase.app.App  {
        return firebase.initializeApp(environment.firebase, "Secondary");
    }

    changePassword(currentPassword, newPassword): Promise<any> {
        this.reauthenticate(currentPassword).then(() => {
            var user = firebase.auth().currentUser;
            user.updatePassword(newPassword).then(() => {
                return
            }).catch((error) => {return error;});
        }).catch((error) => {return error;});
        return
    }

    reauthenticate(currentPassword) {
        var user = firebase.auth().currentUser;
        var cred = firebase.auth.EmailAuthProvider.credential(
            user.email, currentPassword);
        return user.reauthenticateWithCredential(cred);
    }
    
}
