import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/internal/operators/take';
import { Folder } from 'src/app/models/folder.model';
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

  dummyList = [['Wortschatz', 'folder'],['Personalform', 'folder'],['Satzstellung', 'folder']]

  data;
  currentUser;
  loaded = false;
  currentPath: string = "";
  currentFolders: Folder[] = [];

  creating = false;
  async ngOnInit() {
    await this.afs.getCurrentUser().valueChanges().pipe(take(1)).toPromise().
    then(data => this.currentUser = data[0]);
    this.currentPath = this.currentUser.uid;

    this.getFolders();
    
  }

  async getFolders() {
    await this.afs.getFolders(this.currentPath).valueChanges().pipe(take(1)).toPromise().
    then(data => {
      this.currentFolders = data.folders
      });
    
    this.loaded = true;
  }

  addFolder(newUid: string, newName: string, newType: string) {
    //create Folder
    var uniqueID = newUid;
    var name = newName;
    var type = newType;
    var newFolder = new Folder(uniqueID, name, type);

    //Add the Folder
    console.log(this.currentFolders); //Just Output Check
    this.currentFolders.push(newFolder);
    this.afs.updateFolders(newFolder, this.currentPath);

    //If it is Type Folder, generate a Collection for it
    if (newFolder.type == "folder") this.afs.addFolderDocument(newFolder.uid, this.currentPath);
    
    
  }

  getSubFolders(folder: string) {
    this.loaded = false;
    this.currentPath = this.currentPath+"/subFolders/"+folder;
    console.log(this.currentPath);
    this.getFolders();
  }
    
  navigate(header, data) {
    var data = data;
    this.appService.myComponent(data);
    this.dashboardService.changes();
    var header = header;
    this.appService.myHeader(header);
  }

  itemclick(item) {

  }

  addElement() {
    this.creating = true;
  }

  submit() {
    if((<HTMLInputElement>document.getElementById('newElement')).value != ''){
      var name = (<HTMLInputElement>document.getElementById('newElement')).value;
      var type = 'folder';
      var uid = uuidv4();
      this.addFolder(uid, name, type);

    }
    
    (<HTMLInputElement>document.getElementById('newElement')).value = '';
    this.creating = false;

  }

}
