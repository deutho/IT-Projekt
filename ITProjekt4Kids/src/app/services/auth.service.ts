import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../interfaces/users.model';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class AuthService {

    docRef: AngularFirestoreDocument<User>;
    user$: Subject<User>;

    constructor(
        private auth: AngularFireAuth,
        private router: Router,
    ) {}

    signOut() {
        this.auth.signOut().then(() => this.router.navigate(['login']));   
    }

    
}
