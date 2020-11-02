import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/internal/operators/take';
import { Folder } from 'src/app/models/folder.model';
import { Folderelement } from 'src/app/models/folderelement.model';
import { AppService } from 'src/app/services/app.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import {v4 as uuidv4} from 'uuid';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit {

  constructor(private router: Router, private appService: AppService, private dashboardService: DashboardService, private afs: FirestoreDataService) { }

  data;
  currentUser;
  loaded = false;
  level;
  currentPath: string = "";
  ownFolders: Folder[] = [];
  derdiedazFolder: Folder[] = [];
  currentFolders: Folder[] = [];

  creating = false;
  async ngOnInit() {
    this.level = 0;
    await this.afs.getCurrentUser().valueChanges().pipe(take(1)).toPromise().
    then(data => this.currentUser = data[0]);
    
    if (this.currentUser.role == 2) this.currentPath = this.currentUser.uid;
    else if (this.currentUser.role == 3) this.currentPath = this.currentUser.parent;
    
    this.getFolders();
  }

  async getFolders() {
    if (this.level == 0){
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
    
    console.log(this.currentFolders);
    console.log(this.ownFolders);
    console.log(this.derdiedazFolder);
    this.loaded = true;
  }

  addFolder(newUid: string, newName: string, newType: string, gameType?: string) {
    
    //create Folder
    if (gameType != null || gameType != undefined)
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
    var data = data;
    this.appService.myComponent(data);
    this.dashboardService.changes();
    var header = header;
    this.appService.myHeader(header);
  }

  async itemclick(item) {
    if (item.type == "folder") {
      

      if (this.level == 0 && item.name == "derdiedaz") {
        this.currentPath = "derdiedaz/"+item.uid;
      }
      else this.currentPath = this.currentUser.uid + "/"+item.uid;
      
      if (this.level != 0) this.currentPath = this.currentPath+ "/" + item.uid;
      
      this.level++
      
      var folderElement: Folderelement;
      var docname: string;
      (await this.afs.getSubFolder(this.currentPath, item.name).snapshotChanges().pipe(take(1)).toPromise()).
      map(data => {
        folderElement = data.payload.doc.data();
        docname = data.payload.doc.id;
      });

      console.log(folderElement.parent);
      console.log(docname);
      this.currentPath = this.currentPath + "/" + docname;
      this.getFolders();
    }

    else if (item.type == "task") {
      var data = item.uid;
      console.log(data);
      this.appService.myGameData(data);
      this.navigate(item.name, item.gameType);
      
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
      if (type ="folder") this.addFolder(uid, name, type);
      else {
        var gameType = 'vocabular-game';
        this.addFolder(uid, name, type, gameType)
      }
      
    }
    
    (<HTMLInputElement>document.getElementById('newElement')).value = '';
    this.creating = false;
  }

}
