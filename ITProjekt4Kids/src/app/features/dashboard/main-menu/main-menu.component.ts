import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/internal/operators/take';
import { map } from 'rxjs/operators';
import { Game } from 'src/app/models/game.model';
import { Task } from 'src/app/models/task.model';
import { AppService } from 'src/app/services/app.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import { GamesModule } from '../../games/games.module';

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
  startDocument: Game;
  currentPath: string = "";
  currentData: Task[];
  currentID: string[];

  creating = false;
  async ngOnInit() {
    await this.afs.getCurrentUser().valueChanges().pipe(take(1)).toPromise().
    then(data => this.currentUser = data[0]);
    
    this.currentPath = this.currentUser.uid;
    this.getUserDocument();
    this.loaded = true;

    console.log(this.startDocument);
  }

  async getUserDocument() {
    var docRef = this.afs.getTasks(this.currentPath);
    docRef.ref
  }
    
  navigate(header, data) {
    var data = data;
    this.appService.myComponent(data);
    this.dashboardService.changes();
    var header = header;
    this.appService.myHeader(header);
  }

}
