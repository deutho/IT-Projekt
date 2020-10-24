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
    dbpath: string = "";

    constructor(public _afs: AngularFirestore, public _auth: AuthService) {
    }
    
    getAllStudents(): AngularFirestoreCollection<User> {

    return null        
    }

    getCurrentUser(): AngularFirestoreDocument<User> {
        if (this.dbpath == "") this.setDBPath();
        return this._afs.collection('users').doc(this._auth.getCurrentUser().uid);
    }

    addUser(user: User) {
        this.db.collection("users/1lPEcyUVfRVxXsPWbCrOxPjMsrv1/teachers/x4PEJU0ktfOpWBfrvxPgoqPLYgn1/students").doc(user.uid).set(JSON.parse(JSON.stringify(user)));
    }

    private setDBPath() {
        let uid = this._auth.getCurrentUser().uid;
        let userRef = this.db.collection('users').doc(uid);
        var query;
        let dbfound: boolean = false;

        userRef.get().then((docSnapshot) => {
            if (docSnapshot.exists) {
                this.dbpath = "users";
                dbfound = true;
            }
        });

        if (!dbfound) {
             query = this.db.collectionGroup('teachers').where('id', '==', uid);
             query.doc(uid).get().then((docSnapshot) => {
                if (docSnapshot.exists) {
                    this.dbpath = "teachers";
                    dbfound = true;
                }
             });
        }

        if (!dbfound) {
            query = this.db.collectionGroup('students').where('id', '==', uid);
            query.doc(uid).get().then((docSnapshot) => {
                if (docSnapshot.exists) {
                    this.dbpath = "students";
                    dbfound = true;
                }
            });
        }
    }

}





    
    