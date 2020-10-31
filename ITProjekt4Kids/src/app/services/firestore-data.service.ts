import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreCollectionGroup, AngularFirestoreDocument, fromDocRef } from '@angular/fire/firestore';
import { User } from '../models/users.model';
import { AuthService } from './auth.service';
import * as firebase from 'firebase';
import { Game } from '../models/game.model';
import { Folder } from '../models/folder.model';




@Injectable({ providedIn: 'root' })
export class FirestoreDataService {
    db = firebase.firestore();

    constructor(public _afs: AngularFirestore, public _auth: AuthService) {
    }
    
    getAllStudents(teacher_uid): AngularFirestoreCollection<User> {
    return null        
    }

    getCurrentUser(): AngularFirestoreCollectionGroup<User> {
        return this._afs.collectionGroup('users', ref => ref.where('uid', "==", this._auth.getCurrentUser().uid));
    }

    addUser(user: User) {
        this.db.collection("users/1lPEcyUVfRVxXsPWbCrOxPjMsrv1/users/x4PEJU0ktfOpWBfrvxPgoqPLYgn1/users").doc(user.uid).set(JSON.parse(JSON.stringify(user)));
    }

    getTasksofTeacherbyClass(teacherUID, classname): AngularFirestoreCollection<Game> {
        return this._afs.collection("tasks/"+teacherUID+"/classes/"+classname+"/class-tasks");
    }

    getFolders(path: string): AngularFirestoreDocument {
        return this._afs.doc("folders/"+path);
    }

    updateFolders(folder: Folder, currentPath: string) {
        return this.db.doc("folders/"+currentPath).update({
            folders: firebase.firestore.FieldValue.arrayUnion(JSON.parse(JSON.stringify(folder)))
        });
    }
    addFolderDocument(uid: string, path: string): void{
        this.db.doc("folders/"+path).collection(uid).add({
            folders: []
        });
    }
}





    
    