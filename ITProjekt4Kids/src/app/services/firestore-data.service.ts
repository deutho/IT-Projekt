import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreCollectionGroup, AngularFirestoreDocument, fromDocRef } from '@angular/fire/firestore';
import { User } from '../models/users.model';
import { AuthService } from './auth.service';
import * as firebase from 'firebase';
import { VocabularyGame } from '../models/VocabularyGame.model';
import { Folder } from '../models/folder.model';
import { Folderelement } from '../models/folderelement.model';
import { take } from 'rxjs/operators';




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
    getUserPerID(uid: string): AngularFirestoreCollectionGroup<User> {
        return this._afs.collectionGroup('users', ref => ref.where('uid', "==", uid));
    }

    addUser(user: User, parent: User) {
        if (user.role == 2){
            this.db.collection("users/"+user.parent+"/users").doc(user.uid).set(JSON.parse(JSON.stringify(user)));
        } else {
            this.db.collection("users/"+parent.parent+"/users/"+parent.uid+"/users").doc(user.uid).set(JSON.parse(JSON.stringify(user)));
        }
    }

    getTasksPerID(id): AngularFirestoreCollection<VocabularyGame> {
        return this._afs.collection('games', ref => ref.where('folderUID', '==', id));
    }

    getFolders(path: string): AngularFirestoreDocument {
        return this._afs.doc("folders/"+path);
    }

    updateFolders(folder: Folder, currentPath: string) {
        return this.db.doc("folders/"+currentPath).update({
            folders: firebase.firestore.FieldValue.arrayUnion(JSON.parse(JSON.stringify(folder)))
        });
    }
    addFolderDocument(uid: string, name: string, path: string): void{
        this.db.doc("folders/"+path).collection(uid).add({
            parent: name,
            folders: []
        });
    }
    getSubFolder(path: string, name: string): AngularFirestoreCollection<Folderelement> {
        return this._afs.collection("folders/"+path, ref => ref.where('parent', '==', name));
    }

    initializeFolderDocument(uid: string) {
        this.db.collection("folders").doc(uid).set({
            parent: "folders",
            folders: []
        });
    }

    updateTask(task) {
        this.db.collection("games").doc(task.uid).set(JSON.parse(JSON.stringify(task)));
    }

    createResult(uid: string, totalRounds: number, roundsWon: number, folderID: number, duration: number) {
        this.db.collection('results/'+uid+"/results").add({
            totalRounds: totalRounds,
            roundsWon: roundsWon,
            folderUID: folderID,
            duration: duration, 
        });
    }

    addBugReport(description: string, user: string, affected: string) {
        this.db.collection("bugreports").add({
            description: description,
            user: user,
            affected: affected,
        });
    }
    
}





    
    