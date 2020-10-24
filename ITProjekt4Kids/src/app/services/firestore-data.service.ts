import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreCollectionGroup, AngularFirestoreDocument, fromDocRef } from '@angular/fire/firestore';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/users.model';
import { AuthService } from './auth.service';
import * as firebase from 'firebase';



@Injectable({ providedIn: 'root' })
export class FirestoreDataService {
    db = firebase.firestore();

    constructor(public _afs: AngularFirestore, public _auth: AuthService) {
    }
    
    getAllStudents(): AngularFirestoreCollection<User> {

    return null        
    }

    getCurrentUser(): AngularFirestoreCollectionGroup<User> {
        console.log(this._auth.getCurrentUser().uid)
        return this._afs.collectionGroup('users', ref => ref.where('uid', "==", this._auth.getCurrentUser().uid));
        
    }

    addUser(user: User) {
        this.db.collection("users/1lPEcyUVfRVxXsPWbCrOxPjMsrv1/teachers/x4PEJU0ktfOpWBfrvxPgoqPLYgn1/students").doc(user.uid).set(JSON.parse(JSON.stringify(user)));
    }

    

}





    
    