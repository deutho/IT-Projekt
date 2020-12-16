import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';
import { take } from 'rxjs/internal/operators/take';
import { Folder } from 'src/app/models/folder.model';
import { Folderelement } from 'src/app/models/folderelement.model';
import { AppService } from 'src/app/services/app.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { environment } from 'src/environments/environment';
import {v4 as uuidv4} from 'uuid';


@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit {

  constructor(private fb: FormBuilder, private router: Router, private appService: AppService, private afs: FirestoreDataService, private cboardService: ClipboardService, private nav: NavigationService) {
      
   }

  data;
  currentUser;
  loaded = false;
  level;
  error;
  redirecterror;
  errorMessage;
  currentDocKey: string = "";
  ownFolders: Folder[] = [];
  derdiedazFolder: Folder[] = [];
  currentFolders: Folder[] = [];
  currentPathForHTML: string = "";
  addElementForm: FormGroup;
  editElementForm: FormGroup;
  formSubmitted = false;
  gameSelected = false;
  emptyMessage: string = "Keine Elemente in diesem Ordner";
  creating = false;
  editing = false;
  deleting = false;
  redirectdata: string[] = [];
  redirected: boolean = false;
  redirectitem;
  studentMode;
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
  
  

  async ngOnInit() {
    this.appService.myRedirect$.subscribe((redirect) => {
      this.redirectdata = redirect;
    });

    this.appService.myStudentMode$.subscribe((studentMode) => {
      this.studentMode = studentMode;
    });

    this.appService.myLastPath$.subscribe((lastpath) => {
      this.lastpath = lastpath;
    });


    this.isDeployment = environment.isDeployment; // delete when project is done
    this.addElementForm = this.fb.group({
      name:  ['', Validators.required],
      game:  []
    });

    this.level = 0; //set the level for the first query

    //get the current User
    await this.afs.getCurrentUser().then(data => this.currentUser = data[0]);
    
    //If the user was redirected
    if (this.redirectdata.length != 0) {
      this.redirected = true;
      //set the redirection path
      this.currentDocKey = this.redirectdata[1];
      
      //get the folders for the path and choose the redirected one per UID 
      let folders: Folder[];
      await this.afs.getFolderElement(this.redirectdata[2]).
      then(data => {
        console.log(data)
        //If there is no Item with the given id or it has been deleted
        if (data == undefined) {
          //TODO show error
          this.failed = true;
        } else {
            folders = data.folders
            folders.forEach(element => {
            if (element.uid == this.redirectdata[1]) 
              this.redirectitem = element;        
            });
            if (this.redirectitem == undefined) {
              //TODO show error
             this.failed = true;
            }
          }
        });
      
      console.log(this.failed)
      //Set the path for the User in the navbar
      this.currentPathForHTML = "Geteilt von "+this.redirectdata[0]+"/";
      //empty the behaviour subject after is was consumed
      this.appService.myRedirectData([])
    } 
    //if the user is not redirected or the redirection failed do this
    if (this.redirected == false || this.failed == true) {
      //Only of the user is not and admin
      if (this.currentUser.role != 1){
        //check if there is a lastpath (returning from a game)
        
        if (this.lastpath.length != 0){
          
          //set the last paths and the level
          this.currentDocKey = this.lastpath[0];
          this.currentPathForHTML = this.lastpath[1];
          this.level = parseInt(this.lastpath[2]);
          //empty the behaviour subject after is was consumed
          this.appService.myLastPath([]);
        }
        //set the path according to teacher and student if there was not lastpath
        
        else if (this.currentUser.role == 2) this.currentDocKey = this.currentUser.uid;
        else if (this.currentUser.role == 3) this.currentDocKey = this.currentUser.parent;
        console.log(this.currentDocKey);
        console.log(this.currentUser.role)
      }
    }

    //perform the itemclick in case of a redirection, otherways load folders on currentpath
    if (this.redirected == true && this.failed == false) {
      this.itemclick(this.redirectitem);
    } else this.getFolders();

  } 
  

  async getFolders() {
    if (this.currentUser.role != 1) {

      //get derdiedaz folders
      if (this.level == 0 && (this.redirected != true || this.failed == true)) await this.afs.getFolderElement("Standardübungen").then(data => this.derdiedazFolder = data.folders);
      console.log(this.derdiedazFolder);
      await this.afs.getFolderElement(this.currentDocKey).then(data => this.ownFolders = data.folders);
      console.log(this.ownFolders);
      this.ownFolders.sort((a, b) => {
        if (a.name < b.name) {return -1;}
        if (a.name > b.name) {return 1;}
        return 0;
      });
      if (this.level == 0) {
        this.currentFolders = this.derdiedazFolder.concat(this.ownFolders);
      } else {
        this.currentFolders = this.ownFolders;
      }
      console.log(this.currentFolders);
   }
    console.log(this.failed)
    this.loaded = true;
    console.log(this.loaded);
    //if there was a redirect error - inform the user
    if (this.failed == true) {
      this.failed = false;
      this.redirecterror = true;
      this.errorMessage = "Das Element existiert nicht oder wurde gelöscht. Wir haben dich zu deinen Ordner weitergeleitet."
      setTimeout(() => this.redirecterror = false, 5000);
    }
  }

  addFolder(newUid: string, newName: string, newType: string, gameType?: string) {
    
    //create Folder
    if (gameType != null && gameType != undefined)
    var newFolder = new Folder(newUid, newName, newType, gameType);
    else newFolder = new Folder(newUid, newName, newType);

    //Add the Folder
    console.log(this.currentFolders); //Just Output Check
    this.currentFolders.push(newFolder);
    this.afs.updateFolders(newFolder, this.currentDocKey);

    //If it is Type Folder, generate a Collection for it
    if (newFolder.type == "folder") this.afs.addFolderDocument(newFolder.uid, this.currentDocKey); 
  }
    
  

  async itemclick(item) {
    if (item.type == "folder") {
      if (item.name == "derdiedaz") {
        this.currentDocKey = "derdiedaz";
        this.currentPathForHTML = "derdieDAZ Standard Übungen"
      } else {
        this.currentDocKey = item.uid;
        if (this.level == 0) this.currentPathForHTML = this.currentPathForHTML + item.name;
        else this.currentPathForHTML = this.currentPathForHTML + "/" + item.name;
      }
      this.level++
      this.getFolders();
      history.pushState(null, 'placeholder');
      
    }
    else if (item.type == "task") {
      var standard = false;
      var data = item.uid;
      this.appService.myGameData(data);
      this.appService.myLastPath([this.currentDocKey, this.currentPathForHTML, this.level]);
      var type = item.gameType;
      if (this.currentUser.role == 2 && this.redirected == false && this.studentMode == false) { 
        type = type+"-edit";
        if (this.currentPathForHTML.substring(0,9) == "derdieDAZ") standard = true;
      }
      if (standard == false) this.navigate(item.name, type);
      else {
        this.errorMessage = "Diese Übung ist standardmäßig inkludiert und kann daher nicht verändert oder gelöscht werden."
        this.error = true
        setTimeout(() => this.error = false, 4000);
      }
    }
  }

 

  editElement(item) {
    if (this.currentPathForHTML.substring(0,9) != "derdieDAZ" && item.uid != 'derdiedaz') {
      this.editElementForm = this.fb.group({
        name:  [item.name, Validators.required],
      });
      this.folderToChange = item;
      this.editing = true;
    }
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
      this.getFolders();
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

  backButtonClicked() {
    history.back();
  }

 async goUpOneLevel() {
    if (this.level != 0) {
      if (this.level == 1) {
        if (this.currentUser.role == 2) this.currentDocKey = this.currentUser.uid;
        else if (this.currentUser.role == 3) this.currentDocKey = this.currentUser.parent;
        this.currentPathForHTML = "";
      }else {
        await this.afs.getFolderElement(this.currentDocKey).then(data => this.currentDocKey = data.parent);
        this.currentPathForHTML = this.currentPathForHTML.substring(0, this.currentPathForHTML.lastIndexOf('/'))
      }
      this.level--;
      this.getFolders();
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
    this.directurl = url+'/direct?user='+this.currentUser.firstname+"-"+this.currentUser.lastname+'&doc='+this.currentDocKey+'&item='+item.uid;
    this.shareGameOverlay = true;
  }

  copied() {
    this.cboardService.copy(this.directurl);
    this.linkCopied = true
    setTimeout(() => this.linkCopied = false, 2500);
  }

  deleteElement(item) {
    //in case someone is dumb enough and trys to delete our derdiedaz games *hust* schiffer *hust*
    if (this.currentPathForHTML.substring(0,9) != "derdieDAZ" && item.uid != 'derdiedaz') {
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

      await this.afs.deleteFolder(this.itemtodelete, this.currentDocKey).then(() => this.getFolders());
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
    if (cascading == false) await this.afs.deleteFolder(item, this.currentDocKey).then(() => this.getFolders());
  }
  
  toggleStudentMode() {
    this.appService.myStudentMode();
  }
  

  @HostListener('window:popstate', ['$event'])
  onBrowserBackBtnClose(event: Event) {
    event.preventDefault();
    if (this.level > 0) {
      this.goUpOneLevel();
    } 
  }

  navigate(header, data) {
    this.nav.navigate(header, data);
    }


}
