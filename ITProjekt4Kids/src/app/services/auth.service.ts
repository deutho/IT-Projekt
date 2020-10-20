import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../interfaces/users.model';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {

    user$: Observable<User>;

    constructor(
        private afAuth: AngularFireAuth,
        private afs: AngularFirestore,
        private router: Router
    ) { 

        this.user$ = this.afAuth.authState.pipe(
            switchMap(user => {

                if (user) {
                    
                    return this.afs.doc<User>('users/${user.uid}').valueChanges();
                } else {
                    return of(null);
                }
            })
        )
    }
    async signIn(email, password) {
        this.afAuth.signInWithEmailAndPassword(email, password);
    }

    public updateUserData(user){
        const userRef: AngularFirestoreDocument<User> = this.afs.doc('users/${user.uid}');

        const data = {
            uid: user.uid,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            photoID: user.photoID,
            role: user.role
        }

        return userRef.set(data, {merge: true})
    }

    async signOut() {
        await this.afAuth.signOut();
        this.router.navigate(['login']);
    }

}