import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/internal/operators/take';
import { AppService } from 'src/app/services/app.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';

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

  creating = false;
  async ngOnInit() {
    await this.afs.getCurrentUser().valueChanges().pipe(take(1)).toPromise().
    then(data => this.currentUser = data[0]);
    this.loaded = true;
  }

  addElement() {
    this.creating = true;
  }

  submit() {
    if((<HTMLInputElement>document.getElementById('newElement')).value != ''){
      this.dummyList.push([(<HTMLInputElement>document.getElementById('newElement')).value, 'folder']);
    }
    
    (<HTMLInputElement>document.getElementById('newElement')).value = '';
    this.creating = false;
  }

  navigate(header, data) {
    var data = data;
    this.appService.myComponent(data);
    this.dashboardService.changes();
    var header = header;
    this.appService.myHeader(header);
  }

  

  itemclick(item) {


    //dummy values for the moment, delete later - change out with actual database request result
    if(item[0] == 'Wortschatz'){
      this.dummyList = [['Tiere', 'task'],['Schulutensilien', 'task'],['Musikinstrumente', 'task']]
    }
    else if(item[0] == 'Tiere'){
      if (this.currentUser.role == 2) this.navigate("Wortschatzspiel-Ordner bearbeiten", "vocabular-game-edit");
      else if (this.currentUser.role == 3) this.navigate("Wortschatz", "vocabular-game");
    }
    else {
      this.dummyList = [[item[0] + ' 1', 'task'],[item[0] + ' 2', 'task'],[item[0] + ' 3', 'task']]
    }
  }

}
