import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../interfaces/users.model';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {

    user$: Observable<User>;

    constructor(
        private afAuth: AngularFireAuth,
        private afs: AngularFirestore,
        private router: Router
    ) {}

    async signIn(username, password) {
        username = username + '@derdiedaz.at'
        this.afAuth.signInWithEmailAndPassword(username, password).then((credential) =>{
            this.setUserObservable(credential.user)
        })
        
    }

    async signOut() {
        await this.afAuth.signOut();
        this.router.navigate(['login']);
    }

    private setUserObservable(user) {
        this.user$ = this.afs.doc('users/${user.uid}').valueChanges();
        
       
     }

     public getCurrentUser() {
         return this.user$;
     }


    
}
