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
      this.appService.myRedirect$.subscribe((redirect) => {
        this.redirectdata = redirect;
      });

    this.appService.myStudentMode$.subscribe((studentMode) => {
      this.studentMode = studentMode;
    });

    this.appService.myLastPath$.subscribe((lastpath) => {
      this.lastpath = lastpath;
    });

   }

  data;
  currentUser;
  loaded = false;
  level;
  error;
  redirecterror;
  errorMessage;
  currentPath: string = "";
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
  redirectdata: string[] = [];
  redirected: boolean = false;
  redirectitem;
  studentMode;
  shareGameOverlay = false;
  directurl = "";
  linkCopied = false;
  lastpath;
  folderToChange: Folder;
  failed: boolean = false;

  async ngOnInit() {
    
    this.addElementForm = this.fb.group({
      name:  ['', Validators.required],
      game:  []
    });

    this.level = 0; //set the level for the first query
    await this.afs.getCurrentUser().valueChanges().pipe(take(1)).toPromise().
    then(data => this.currentUser = data[0]);
    
    //If the user was redirected
    if (this.redirectdata.length != 0) {
      this.redirected = true;
      //set the redirection path
      this.currentPath = this.redirectdata[1];
      
      //get the folders for the path and choose the redirected one per UID 
      let folders: Folder[];
      await this.afs.getFolders(this.redirectdata[1]).valueChanges().pipe(take(1)).toPromise().
      then(data => {
        console.log(data)
        //If there is no Item with the given id or it has been deleted
        if (data == undefined) {
          //TODO show error
          this.failed = true;
        } else {

            folders = data.folders
            folders.forEach(element => {
            if (element.uid == this.redirectdata[2]) 
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
        console.log(this.lastpath);
        if (this.lastpath.length != 0){
          
          //set the last paths and the level
          this.currentPath = this.lastpath[0];
          this.currentPathForHTML = this.lastpath[1];
          this.level = parseInt(this.lastpath[2]);
          //empty the behaviour subject after is was consumed
          this.appService.myLastPath([]);
        }
        //set the path according to teacher and student if there was not lastpath
        else if (this.currentUser.role == 2) this.currentPath = this.currentUser.uid;
        else if (this.currentUser.role == 3) this.currentPath = this.currentUser.parent;
      }
    }

    //perform the itemclick in case of a redirection, otherways load folders on currentpath
    
    if (this.redirected == true && this.failed == false) {
      this.itemclick(this.redirectitem);
    } else this.getFolders();

    
  } 
  

  async getFolders() {
    if (this.currentUser.role != 1) {
      if (this.level == 0 && (this.redirected != true || this.failed == true)){
      await this.afs.getFolders("derdiedaz").valueChanges().pipe(take(1)).toPromise().
      then(data => {
        this.derdiedazFolder = data.folders
        });
      }

      await this.afs.getFolders(this.currentPath).valueChanges().pipe(take(1)).toPromise().
      then(data => {
        this.ownFolders = data.folders
        });

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
   }
    
    this.loaded = true;
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
    this.afs.updateFolders(newFolder, this.currentPath);

    //If it is Type Folder, generate a Collection for it
    if (newFolder.type == "folder") this.afs.addFolderDocument(newFolder.uid, this.currentPath); 
  }
    
  navigate(header, data) {
    this.nav.navigate(header, data);
    }

  async itemclick(item) {
    if (item.type == "folder") {
      
      if (item.name == "derdiedaz") {
        this.currentPath = "derdiedaz/derdiedaz";
        this.currentPathForHTML = "derdieDAZ Standard Übungen"
      } else {
        this.currentPath = this.currentPath + "/"+item.uid;
        if (this.level == 0) this.currentPathForHTML = this.currentPathForHTML + item.name;
        else this.currentPathForHTML = this.currentPathForHTML + "/" + item.name;
      }
      
      
      var folderElement: Folderelement;
      var docname: string;
      (await this.afs.getSubFolder(this.currentPath, item.uid).snapshotChanges().pipe(take(1)).toPromise()).
      map(data => {
        folderElement = data.payload.doc.data();
        docname = data.payload.doc.id;
      });

      this.currentPath = this.currentPath + "/" + docname;
      this.level++
      this.getFolders();
      history.pushState(null, 'placeholder');
      
    }

    else if (item.type == "task") {
      var standard = false;
      var data = item.uid;
      this.appService.myGameData(data);
      this.appService.myLastPath([this.currentPath, this.currentPathForHTML, this.level]);
      var type = item.gameType;
      if (this.currentUser.role == 2 && this.redirected == false && this.studentMode == false) { 
        type = type+"-edit";
        if (this.currentPath.substring(0,9) == "derdiedaz") standard = true;
      }
      if (standard == false) this.navigate(item.name, type);
      else {
        this.errorMessage = "Diese Übung ist standardmäßig inkludiert und kann daher nicht verändert oder gelöscht werden."
        this.error = true
        setTimeout(() => this.error = false, 4000);
      }
    }
  }

  addElement() {
    this.creating = true;
  }

  editElement(item) {
    this.editElementForm = this.fb.group({
      name:  [item.name, Validators.required],
    });
    this.folderToChange = item;
    this.editing = true;
  }

  edit() {
    if (this.editElementForm.valid && this.editElementForm.get('name').value != this.folderToChange.name) {
      
      //change the folder value in the database and load new (in one transaction)
      this.afs.deleteFolder(this.folderToChange, this.currentPath).then(() => {
        this.folderToChange.name = this.editElementForm.get('name').value;
      this.afs.updateFolders(this.folderToChange, this.currentPath);
      }).then(() => this.getFolders()).catch(err => console.log(err))
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

  goUpOneLevel() {
    if (this.level != 0) {
      if (this.level == 1) {
        if (this.currentUser.role == 2) this.currentPath = this.currentUser.uid;
        else if (this.currentUser.role == 3) this.currentPath = this.currentUser.parent;

        this.currentPathForHTML = "";
      }else {

        for (let i = 0; i<=1; i++) {
        this.currentPath = this.currentPath.substring(0, this.currentPath.lastIndexOf('/'));
        }
        this.currentPathForHTML = this.currentPathForHTML.substring(0, this.currentPathForHTML.lastIndexOf('/'))
      }
      this.level--;
      this.getFolders();
    }
  }

  onSubmit() {
    if (this.addElementForm.valid) {
      let name :string = this.addElementForm.get('name').value;
      let game :string = this.addElementForm.get('game').value;
      let createFolder = !this.gameSelected;
      console.log(createFolder);
      var uid = uuidv4();
      if (createFolder) this.addFolder(uid, name, 'folder');
      else {
        this.addFolder(uid, name, 'task', game)
      }

    }
    this.creating = false;
  }

  createLink(item) {
    var url = environment.shareableURL;
    this.directurl = url+'/direct?user='+this.currentUser.firstname+"-"+this.currentUser.lastname+'&path='+this.currentPath+'&item='+item.uid;
    this.shareGameOverlay = true;
  }

  deleteElement(item) {
    //here to delete

  }
  
  toggleStudentMode() {
    this.appService.myStudentMode();
  }
  copied() {
    this.cboardService.copy(this.directurl);
    this.linkCopied = true
    setTimeout(() => this.linkCopied = false, 2500);
  }

  @HostListener('window:popstate', ['$event'])
  onBrowserBackBtnClose(event: Event) {
    event.preventDefault();
    if (this.level > 0) {
      this.goUpOneLevel();
    } 
  }

}
