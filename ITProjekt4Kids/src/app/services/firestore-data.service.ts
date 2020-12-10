import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreCollectionGroup, AngularFirestoreDocument, fromDocRef } from '@angular/fire/firestore';
import { User } from '../models/users.model';
import { AuthService } from './auth.service';
import * as firebase from 'firebase';
import { VocabularyGame } from '../models/VocabularyGame.model';
import { Folder } from '../models/folder.model';
import { Folderelement } from '../models/folderelement.model';
import { take } from 'rxjs/operators';
import { BugReport } from '../models/bugreport.model';




@Injectable({ providedIn: 'root' })
export class FirestoreDataService {
    db = firebase.firestore();
    storage = firebase.storage();
    storageRef = this.storage.ref();
    

    constructor(public _afs: AngularFirestore, public _auth: AuthService) {
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

    async getTasksPerID(id): Promise<any> {
        let ref: AngularFirestoreCollection<any> = this._afs.collection('games', ref => ref.where('folderUID', '==', id));
        return await ref.valueChanges().pipe(take(1)).toPromise()
    }

    async getFolderElement(uid: string): Promise<Folderelement> {
        let ref: AngularFirestoreDocument<Folderelement> = this._afs.collection("folders").doc(uid);
        return await ref.valueChanges().pipe(take(1)).toPromise()
    }

    updateFolders(folder: Folder, uid: string) {
        return this.db.collection("folders").doc(uid).update({
            folders: firebase.firestore.FieldValue.arrayUnion(JSON.parse(JSON.stringify(folder)))
        });
    }

    deleteFolder(folder: Folder, uid: string) {
        return this.db.collection("folders").doc(uid).update({
            folders: firebase.firestore.FieldValue.arrayRemove(JSON.parse(JSON.stringify(folder)))
        });
    }

    deleteDocument(collection: string, uid: string) {
        this.db.collection(collection).doc(uid).delete();
    }
    
    addFolderDocument(uid: string, parent: string): void{
        this.db.collection("folders").doc(uid).set({
            parent: parent,
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

    addBugReport(description: string, user: string, status: string): boolean {
        let success = true;
        this.db.collection("bugreports").add({
            description: description,
            user: user,
            time: firebase.firestore.FieldValue.serverTimestamp(),
            status: status
        }).catch(()=>{
            success = false;
        });
    return success;
    }

    getBugReportsByUser(user: string): AngularFirestoreCollection<BugReport> {
        return this._afs.collection("bugreports", ref => ref.where('user', "==", user));
    }

    deleteFromStorageByUrl(url: string): Promise<any> {
        return this.storage.refFromURL(url).delete();
    }
    
}





    
    