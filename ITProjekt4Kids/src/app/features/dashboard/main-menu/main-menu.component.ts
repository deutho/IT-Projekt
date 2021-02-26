import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';
import { Folder } from 'src/app/models/folder.model';
import { Folderelement } from 'src/app/models/folderelement.model';
import { User } from 'src/app/models/users.model';
import { AppService } from 'src/app/services/app.service';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import { environment } from 'src/environments/environment';
import { HighlightSpanKind, textSpanIntersectsWithPosition } from 'typescript';
import {v4 as uuidv4} from 'uuid';


@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit {

  constructor(private fb: FormBuilder, private router: Router, private appService: AppService, private afs: FirestoreDataService, private cboardService: ClipboardService, private auth: AuthService, private route: ActivatedRoute) {
 
   }

  data;
  currentUser: User;
  loaded = false;
  level;
  error;
  redirecterror;
  errorMessage;
  currentPathForHTML;
  currentDocKey: string = "";
  parentDocKey: string = "";
  currentFolder: Folder;
  ownFolders: Folder[] = [];
  derdiedazFolder: Folder[] = [];
  currentFolders: Folder[] = [];
  addElementForm: FormGroup;
  editElementForm: FormGroup;
  formSubmitted = false;
  gameSelected = false;
  emptyMessage: string = "Keine Elemente in diesem Ordner";
  creating = false;
  editing = false;
  deleting = false;
  standard = false;
  redirectdata: string[] = [];
  redirected: boolean = false;
  redirectitem;
  shareGameOverlay = false;
  deleteElementOverlay = false;
  directurl = "";
  linkCopied = false;
  lastpath;
  folderToChange: Folder;
  failed: boolean = false;
  itemtodelete: Folder;
  creatingElementError = false;
  isDeployment = false;
  userSubscriptpion;
  unauthorized: boolean = false;
  currentFolderElement: Folderelement;
  isOwnerOfCurrentFolder: boolean;
  isEditorOfCurrentFolder: boolean;

  

  async ngOnInit() {
    //get the currentuser
    await this.afs.getCurrentUser().then(data => this.currentUser = data[0]);

    this.isDeployment = environment.isDeployment; // delete when project is done

    //add Element Form
    this.addElementForm = this.fb.group({
      name:  ['', Validators.required],
      game:  []
    });

    //subscription to the active route
    this.route.params.subscribe(params => {
      let id: string = params['id'];
      this.initialize(id);
    });
  }

  //initialize the component after a path change
  async initialize(id) {
    this.isOwnerOfCurrentFolder = false;
    this.isEditorOfCurrentFolder = false;

    console.log(id);
    if (id === " ") {
      console.log(this.currentUser.role);
      if (this.currentUser.role == 3) this.router.navigate([this.currentUser.parent])
      if (this.currentUser.role == 2) this.router.navigate([this.currentUser.uid])
    } else {
      this.currentDocKey = id;


      await this.afs.getFolderElement(id).then(data => {
        this.currentFolderElement = data;
      });

      //go to notfound, if there is no data
      if (this.currentFolderElement == undefined) {
        this.router.navigate(['notfound'])
      } else {
      
        //set the parent dockey
        this.parentDocKey = this.currentFolderElement.parent;


        if (this.parentDocKey != "root") {
          //get the current folder only if it is not a topfolder
          await this.afs.getFolderElement(this.parentDocKey).then(data => {
            let f: Folder[]  = data.folders;
            f.forEach(folder => {
              if (folder.uid == id) this.currentFolder = folder
            });
          });
          this.appService.myHeader(this.currentFolder.name);
          if (this.currentFolder.owner == this.currentUser.uid){
            this.isOwnerOfCurrentFolder = true;
            this.isEditorOfCurrentFolder = true;
          } 
          if (this.currentFolder.editors.includes(this.currentUser.uid)) this.isEditorOfCurrentFolder = true;

        }
        else {
          if (this.currentDocKey == this.currentUser.uid) {
            this.isOwnerOfCurrentFolder = true;
            this.isEditorOfCurrentFolder = true;
          }
          this.appService.myHeader("Startseite");
        }
        this.getFolders(id)
      }
    }
  }

  async getFolders(id: string) {
    if (this.currentUser.role != 1) {

      //get derdiedaz folders only on the startpage of the respective user
      let level0: boolean = false;
      if ((this.currentUser.role == 2 && this.currentUser.uid === id) || (this.currentUser.role == 3 && this.currentUser.parent === id)) {
        await this.afs.getFolderElement("Standardübungen").then(data => this.derdiedazFolder = data.folders);
        level0 = true;
      }
      
      this.ownFolders = this.currentFolderElement.folders;
      console.log(this.derdiedazFolder);
      
      console.log(this.ownFolders);
      this.ownFolders.sort((a, b) => {
        if (a.name < b.name) {return -1;}
        if (a.name > b.name) {return 1;}
        return 0;
      });
      if (level0) {
        this.currentFolders = this.derdiedazFolder.concat(this.ownFolders);
      } else {
        this.currentFolders = this.ownFolders;
      }
      console.log(this.currentFolders);
   }
    this.loaded = true;
  } 

  itemclick(item: Folder) {
    if (item.type == "folder") {
        this.router.navigate([item.uid]);
    }
    else if (item.type == "task") {
      this.router.navigate(['game/'+item.uid], {queryParams:{k: this.currentDocKey, t: item.gameType}});
    }
  }

  addFolder(newUid: string, newName: string, newType: string, gameType?: string) {
    
    //create Folder
    if (gameType != null && gameType != undefined)
    var newFolder = new Folder(newUid, newName, newType, this.currentUser.uid, [], gameType);
    else newFolder = new Folder(newUid, newName, newType, this.currentUser.uid, []);

    //Add the Folder
    console.log(this.currentFolders); //Just Output Check
    this.currentFolders.push(newFolder);
    this.afs.updateFolders(newFolder, this.currentDocKey);

    //If it is Type Folder, generate a Collection for it
    if (newFolder.type == "folder") this.afs.addFolderDocument(newFolder.uid, this.currentDocKey); 
  }
    
  editElement(item) {
    this.editElementForm = this.fb.group({
      name:  [item.name, Validators.required],
    });
    this.folderToChange = item;
    this.editing = true;
    
  }

  async edit() {
    if (this.editElementForm.valid && this.editElementForm.get('name').value != this.folderToChange.name) {
      
      //delte the current folder
      await this.afs.deleteFolder(this.folderToChange, this.currentDocKey);
      
      //change the name
      this.folderToChange.name = this.editElementForm.get('name').value;

      //add the folder again
      await this.afs.updateFolders(this.folderToChange, this.currentDocKey);

      //get the folders again
      this.getFolders(this.currentDocKey);
    }
    this.editing = false;
  }

  submit() {
    if((<HTMLInputElement>document.getElementById('newElement')).value != ''){
      var name = (<HTMLInputElement>document.getElementById('newElement')).value;
      var type = 'folder';
      var uid = uuidv4();
      if (type ="folder") this.addFolder(uid, name, "Folder");
      else {
        var gameType = 'vocabular-game';
        this.addFolder(uid, name, "Task", gameType)
      }
    }
    
    (<HTMLInputElement>document.getElementById('newElement')).value = '';
    this.creating = false;
  }

 async goUpOneLevel() {
    if (this.currentDocKey == "derdiedaz") {
      if (this.currentUser.role == 2) this.router.navigate(['app/'+this.currentUser.uid]);
      if (this.currentUser.role == 3) this.router.navigate(['app/'+this.currentUser.parent]);
    } else {
      if (this.parentDocKey != "root") {
        this.router.navigate(['app/'+this.parentDocKey]);
      }
    }
  }

  addElement() {
    this.creating = true;
  }

  createNewElement() {
    let successfulCreated = false;    
      let name :string = this.addElementForm.get('name').value;      
      let createFolder = !this.gameSelected;
      var uid = uuidv4();
      console.log(name)
      if (createFolder) {
        
        if(name == '') {
          //error response
          console.log("error")
          this.creatingElementError = true;
          setTimeout(() => this.creatingElementError = false, 2500);
        }
        else {
          this.addFolder(uid, name, 'folder');
          successfulCreated = true;
        }
      }
      else {
        let game :string = (<HTMLSelectElement>document.getElementById('gameTypeSelector')).value
        if(name == '' || game == '') {
          //error response
          this.creatingElementError = true;
          setTimeout(() => this.creatingElementError = false, 2500);
        }
        else {
          this.addFolder(uid, name, 'task', game)
          successfulCreated = true;
        }
      }    
    if(successfulCreated == true) this.creating = false;
  }

  createLink(item) {
    var url = environment.shareableURL;
    if(item.type == "task") {
      this.directurl = url +'/game/'+item.uid+'?k='+this.currentDocKey+'&t='+item.gameType;
    }
    if(item.type == "folder") {
      this.directurl = url +'/'+item.uid;
    }
    this.shareGameOverlay = true;
  }

  copied() {
    this.cboardService.copy(this.directurl);
    this.linkCopied = true
    setTimeout(() => this.linkCopied = false, 2500);
  }

  deleteElement(item: Folder) {
    //in case someone is dumb enough and trys to delete our derdiedaz games *hust* schiffer *hust*
    if (item.owner == this.currentUser.uid) {
      this.itemtodelete = item;
      this.deleteElementOverlay = true;
    } 
  }
  
  async delete() {
    this.deleting=true;
    if (this.itemtodelete.type == 'task') this.deleteGame(this.itemtodelete, false);
    else if (this.itemtodelete.type == 'folder') {
      let documentsToDelete: string[] = []
      let foldersToCheck: Folder[] = []
      let currentItem: Folder

      //add the first stack of items on the first level
      await this.afs.getFolderElement(this.itemtodelete.uid).then(data => data.folders.forEach(folder => foldersToCheck.push(folder)));
      documentsToDelete.push(this.itemtodelete.uid);

      while (foldersToCheck.length != 0) {
        currentItem = foldersToCheck.pop();
        if(currentItem.type == "task") this.deleteGame(currentItem, true);
        
        if(currentItem.type == "folder") {
          documentsToDelete.push(currentItem.uid);
          await this.afs.getFolderElement(currentItem.uid).then(data => data.folders.forEach(folder => foldersToCheck.push(folder)));
        }
      }

      documentsToDelete.forEach(async element => {
        await this.afs.deleteDocument('folders', element);
      });

      await this.afs.deleteFolder(this.itemtodelete, this.currentDocKey).then(() => this.initialize(this.route.snapshot.params['id']));
    }
    
    this.deleteElementOverlay = false;
    this.deleting=false;
  }

  async deleteGame(item: Folder, cascading: boolean) {
    //Go through the item and delete the cloud storage
    let games
    await this.afs.getTasksPerID(item.uid).then(data => games = data)
    
    console.log(games)

    games.forEach(element => {
      for (let key of Object.keys(element)) {
        if (key != null) {
          if (key == "photoID" && element[key][1].substring(0,37) == "https://firebasestorage.googleapis.com") this.afs.deleteFromStorageByUrl(element[key]);
          if (element[key].length > 1 && element[key][1].substring(0,37) == "https://firebasestorage.googleapis.com") {
            this.afs.deleteFromStorageByUrl(element[key][1])
          }
        }
      }
    });  
    if (cascading == false) await this.afs.deleteFolder(item, this.currentDocKey).then(() => this.initialize(this.route.snapshot.params['id']));
  }
  
}
