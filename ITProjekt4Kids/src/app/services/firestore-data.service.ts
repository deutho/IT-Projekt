import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, fromDocRef } from '@angular/fire/firestore';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/users.model';
import { AuthService } from './auth.service';
import * as firebase from 'firebase';



@Injectable({ providedIn: 'root' })
export class FirestoreDataService {
    db = firebase.firestore();

    constructor(public _afs: AngularFirestore, public _auth: AuthService) {}
    
    getAllUser(): AngularFirestoreCollection<User> {
        return this._afs.collection('users');
    }

    getCurrentUser(): AngularFirestoreDocument<User> {
        return this._afs.collection('users').doc(this._auth.getCurrentUser().uid);
    }

    addUser(user: User) {
        this.db.collection("users").doc(user.uid).set(JSON.parse(JSON.stringify(user)));
    }
}





    
    