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
  errorMessage;
  currentPath: string = "";
  ownFolders: Folder[] = [];
  derdiedazFolder: Folder[] = [];
  currentFolders: Folder[] = [];
  currentPathForHTML: string = "";
  addElementForm: FormGroup;
  formSubmitted = false;
  gameSelected = false;
  emptyMessage: string = "Keine Elemente in diesem Ordner";
  creating = false;
  redirectdata: string[] = [];
  redirected;
  redirectitem;
  studentMode;
  shareGameOverlay = false;
  directurl = "";
  linkCopied = false;
  lastpath;

  async ngOnInit() {
    
    this.addElementForm = this.fb.group({
      name:  ['', Validators.required],
      game:  []
    });

    this.level = 0;
    await this.afs.getCurrentUser().valueChanges().pipe(take(1)).toPromise().
    then(data => this.currentUser = data[0]);
    
    console.log(this.redirectdata);
    if (this.redirectdata.length != 0) {
      this.redirected = true;
      this.currentPath = this.redirectdata[1];
      console.log(this.redirectdata[2]);
      this.redirectitem = this.redirectdata[2];
      this.currentPathForHTML = "Geteilt von "+this.redirectdata[0];
      console.log(this.redirectdata);
      this.appService.myRedirectData([])
    } else {
      this.redirected = false;
      if (this.currentUser.role != 1){
        if (this.lastpath.length != 0){
          this.currentPath = this.lastpath[0];
          this.currentPathForHTML = this.lastpath[1];
          this.level = parseInt(this.lastpath[2]);
          this.appService.myLastPath([]);
        }
        else if (this.currentUser.role == 2) this.currentPath = this.currentUser.uid;
        else if (this.currentUser.role == 3) this.currentPath = this.currentUser.parent;

        if (this.currentPathForHTML == "") this.currentPathForHTML = "Meine Ordner";
      }
    }

    if (this.redirected == true) {
      this.itemclick(this.redirectitem);
    } else this.getFolders();    
  }

  async getFolders() {
    if (this.currentUser.role != 1) {
      if (this.level == 0 && this.redirected != true){
      await this.afs.getFolders("derdiedaz").valueChanges().pipe(take(1)).toPromise().
      then(data => {
        this.derdiedazFolder = data.folders
        });
      }

      await this.afs.getFolders(this.currentPath).valueChanges().pipe(take(1)).toPromise().
      then(data => {
        this.ownFolders = data.folders
        });

      if (this.level == 0) {
        this.currentFolders = this.derdiedazFolder.concat(this.ownFolders);
      } else {
        this.currentFolders = this.ownFolders;
      }
   }
    
    this.loaded = true;
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
    if (newFolder.type == "folder") this.afs.addFolderDocument(newFolder.uid, newFolder.name, this.currentPath); 
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
        this.currentPathForHTML = this.currentPathForHTML + "/" + item.name;
      }
      this.level++
      
      var folderElement: Folderelement;
      var docname: string;
      (await this.afs.getSubFolder(this.currentPath, item.name).snapshotChanges().pipe(take(1)).toPromise()).
      map(data => {
        folderElement = data.payload.doc.data();
        docname = data.payload.doc.id;
      });

      this.currentPath = this.currentPath + "/" + docname;
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

  goUpOneLevel() {
    if (this.level != 0) {
      if (this.level == 1) {
        if (this.currentUser.role == 2) this.currentPath = this.currentUser.uid;
        else if (this.currentUser.role == 3) this.currentPath = this.currentUser.parent;

        this.currentPathForHTML = "Meine Ordner";
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
    this.directurl = url+'/direct?user='+this.currentUser.firstname+"-"+this.currentUser.lastname+'&path='+this.currentPath+'&item='+JSON.stringify(item);
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
