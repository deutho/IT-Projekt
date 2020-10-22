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
    credential;

    constructor(
        private afAuth: AngularFireAuth,
        private afs: AngularFirestore,
        private router: Router,
        private auth: AngularFireAuth
    ) {}

    async signOut() {
        await this.afAuth.signOut();
        this.router.navigate(['login']);
    }

    public setUserObservable() {
        this.auth.onAuthStateChanged
     }

     public getCurrentUser() {
         return this.user$;
     }


    
}
