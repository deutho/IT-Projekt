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
import { BehaviorSubject } from 'rxjs';
import { formatDate } from '@angular/common';




@Injectable({ providedIn: 'root' })
export class FirestoreDataService {
    db = firebase.firestore();
    storage = firebase.storage();
    storageRef = this.storage.ref();

    private currentUser: BehaviorSubject<User> = new BehaviorSubject<User>(null);
    currentUserStatus = this.currentUser.asObservable();

    constructor(public _afs: AngularFirestore, public _auth: AuthService) {
        this.authStatusListener();
    }

    
    //Auth Change Listener for the user observable
    authStatusListener() {
        firebase.auth().onAuthStateChanged(async (credential) => {
            if (credential) {
                await this.getCurrentUser().then(data => this.currentUser.next(data[0]));
            } else {
                this.currentUser.next(null);
            }
        })
    }
   
    /** gets signed in user from DB 
     * 
     */
    async getCurrentUser(): Promise<any> {
        let ref: AngularFirestoreCollectionGroup<any> = this._afs.collectionGroup('users', ref => ref.where('uid', "==", this._auth.getCurrentUser().uid));
        return await ref.valueChanges().pipe(take(1)).toPromise()
    }
    /**gets the user by id
     * 
     * @param uid user id
     */
    getUserPerID(uid: string): AngularFirestoreCollectionGroup<User> {
        return this._afs.collectionGroup('users', ref => ref.where('uid', "==", uid));
    }

    /**
     * Gets all children of a User based on the parents ID
     * @param uid 
     */
    async getChildernUserByParentID(uid: string): Promise<User[]>{
        let ref: AngularFirestoreCollectionGroup<any> = this._afs.collectionGroup('users', ref => ref.where('parent', "==", uid));
        return await ref.valueChanges().pipe(take(1)).toPromise()

    }

    /**adds a user with id and parent
     * 
     * @param user user id
     * @param parent parent id (teacher or admin)
     */
    addUser(user: User, parent: User) {
        if (user.role == 2){
            this.db.collection("users/"+user.parent+"/users").doc(user.uid).set(JSON.parse(JSON.stringify(user)));
        } else {
            this.db.collection("users/"+parent.parent+"/users/"+parent.uid+"/users").doc(user.uid).set(JSON.parse(JSON.stringify(user)));
        }
    }

    /**gets the Questions for a game
     * 
     * @param id folder id
     */
    async getTasksPerID(id): Promise<any> {
        let ref: AngularFirestoreCollection<any> = this._afs.collection('games', ref => ref.where('folderUID', '==', id));
        return await ref.valueChanges().pipe(take(1)).toPromise()
    }

    /** returns the content of a folder !document!
     * 
     * @param uid uid of the Document
     */
    async getFolderElement(uid: string): Promise<Folderelement> {
        let ref: AngularFirestoreDocument<Folderelement> = this._afs.collection("folders").doc(uid);
        return await ref.valueChanges().pipe(take(1)).toPromise()
    }

    /** adds a folder within a document
     * 
     * @param folder the folder to be added
     * @param uid the Document the folder is added to
     */
    updateFolders(folder: Folder, uid: string) {
        return this.db.collection("folders").doc(uid).update({
            folders: firebase.firestore.FieldValue.arrayUnion(JSON.parse(JSON.stringify(folder)))
        });
    }

    /** removes folder from a document
     * 
     * @param folder the folder to be removed
     * @param uid the Document the folder is removed from
     */
    deleteFolder(folder: Folder, uid: string) {
        return this.db.collection("folders").doc(uid).update({
            folders: firebase.firestore.FieldValue.arrayRemove(JSON.parse(JSON.stringify(folder)))
        });
    }

    /** deletes the whole document (can be folder, game, user, ...)
     * 
     * @param collection the collection the document is in (games, users, folders)
     * @param uid the uid of the document you want to delete
     */
    deleteDocument(collection: string, uid: string): Promise<any> {
        return this.db.collection(collection).doc(uid).delete();
    }
    
    /**adds folder document after creating a new folder
     * 
     * @param uid the uid of the folder document
     * @param parent the uid of the parent of the new created folder document
     */
    addFolderDocument(uid: string, parent: string): void{
        this.db.collection("folders").doc(uid).set({
            parent: parent,
            folders: []
        });
    }
   
    /** updates the given task (creates a new task if uid is not already in DB - if uid is known, values are updated)
     * 
     * @param task uid of task
     */
    async updateTask(task) {
        await this.db.collection("games").doc(task.uid).set(JSON.parse(JSON.stringify(task)));
    }

    async updateUserPicture(imageURL : string, uid : string) {
        let ref = await this.db.collectionGroup("users").where("uid","==",uid).get();
        console.log(ref);
        ref.forEach(doc => {
            doc.ref.update({
                photoID: imageURL
            });
        });
    }

    /** temporary result of a finished game
     * 
     * @param uid uid of user (student)
     * @param totalRounds rounds of the game 
     * @param roundsWon rounds correct
     * @param folderID uid of game
     * @param duration time taken to play the game
     */
    createResult(uid: string, totalRounds: number, roundsWon: number, folderID: number, duration: number) {
        this.db.collection('results/'+uid+"/results").add({
            totalRounds: totalRounds,
            roundsWon: roundsWon,
            folderUID: folderID,
            duration: duration, 
        });
    }

    /** adds a bug report to DB (temporary)
     * 
     * @param description description of bug the user wants to report
     * @param user name of user
     * @param status 'offen' or 'geschlossen'
     */
    addBugReport(description: string, user: string, status: string): boolean {
        let success = true;
        let name: string = formatDate(Date.now(),'yyyy-MM-dd HH:mm:ss.SSS','en-GB');
        this.db.collection("bugreports").doc(name).set({
            description: description,
            user: user,
            time: firebase.firestore.FieldValue.serverTimestamp(),
            status: status
        }).catch(()=>{
            success = false;
        });
    return success;
    }

    /** shows the reported bugs of the user
     * 
     * @param user name of user
     */
    getBugReportsByUser(user: string): AngularFirestoreCollection<BugReport> {
        return this._afs.collection("bugreports", ref => ref.where('user', "==", user));
    }

    /**deletes the given element (e.g. image or audio)
     * 
     * @param url url of the element in firebase
     */
    deleteFromStorageByUrl(url: string): Promise<any> {
        return this.storage.refFromURL(url).delete();
    }
    
}





    
    