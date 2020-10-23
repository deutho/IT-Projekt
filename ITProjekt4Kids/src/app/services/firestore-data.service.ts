import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, fromDocRef } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/users.model';
import { AuthService } from './auth.service';
import * as firebase from 'firebase';



@Injectable({ providedIn: 'root' })
export class FirestoreDataService {
    usersCollection: AngularFirestoreCollection<User>;
    userDoc: AngularFirestoreDocument<User>;
    deleteDoc: AngularFirestoreDocument<User>;
    users: Observable<User[]>;
    currentUser: User;
    db = firebase.firestore();

    constructor(public _afs: AngularFirestore, public _auth: AuthService) {
        this.usersCollection = _afs.collection('users', x => x.orderBy('firstname', 'asc'));
        this.users = this.usersCollection.snapshotChanges().pipe(map(

            (changes) => {
                return changes.map(
                    a => {
                        const data = a.payload.doc.data() as User;
                        return data;
                    });
            }));
        }
    

    getUsers() {
        return this.users;
    }

    setCurrentUser() {
        
        let user = this._auth.getCurrentUser();
        if (user != null) {
            console.log(user.uid)
            var userDoc = this.db.collection('users').doc('x4PEJU0ktfOpWBfrvxPgoqPLYgn1');
            userDoc.get().then(doc => {
                this.currentUser = doc.data() as User;
            })
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    addUser(user) {
        this.usersCollection.add(user);
    }

    deleteUser(user) {
        this.deleteDoc = this._afs.doc('users/${user.uid}');
        this.deleteDoc.delete();
    }
}



    
    