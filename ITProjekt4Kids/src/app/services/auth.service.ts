import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';
import { environment } from 'src/environments/environment';
import { AppService } from './app.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';
import { FirestoreDataService } from './firestore-data.service';


@Injectable({ providedIn: 'root' })
export class AuthService {

    

    constructor(
        private router: Router,
    ) {
        this.authStatusListener();
    }

    private authStatusSub = new BehaviorSubject(this.getCurrentUser());
    currentAuthStatus = this.authStatusSub.asObservable();


    //auth change listener for the observable
    authStatusListener() {
        firebase.auth().onAuthStateChanged((credential) => {
            if (credential) {
                this.authStatusSub.next(credential);
            } else {
                this.authStatusSub.next(null);
            }
        })
    }
    signOut() {
        firebase.auth().signOut().then(() => this.router.navigate(['login']));   
    }

    signIn(email, password): Promise<any> {
        return firebase.auth().signInWithEmailAndPassword(email, password).then(() => this.router.navigate(['app']));
    }

    getCurrentUser(): firebase.User {
        return firebase.auth().currentUser;
    }

    GetSecondaryFirebaseApp(): firebase.app.App  {
        return firebase.initializeApp(environment.firebase, "Secondary");
    }

    async changePassword(currentPassword, newPassword): Promise<any> {
        return this.reauthenticate(currentPassword).then(() => {
            var user = firebase.auth().currentUser;
            return user.updatePassword(newPassword);
        });
    }

    reauthenticate(currentPassword) {
        var user = firebase.auth().currentUser;
        var cred = firebase.auth.EmailAuthProvider.credential(
            user.email, currentPassword);
        return user.reauthenticateWithCredential(cred);
    }

    isAuthenticated(): boolean {
        if (firebase.auth().currentUser != null) return true;
        else return false;
    }
    
}
