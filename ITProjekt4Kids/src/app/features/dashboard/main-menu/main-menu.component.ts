import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/services/app.service';
import { DashboardService } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit {

  constructor(private router: Router, private appService: AppService, private dashboardService: DashboardService) { }

  dummyList = [['Wortschatz', 'folder'],['Personalform', 'folder'],['Satzstellung', 'folder']]

  data;

  creating = false;
  ngOnInit(): void {
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

  goToGame() {
    var data = "vocabular-game";
    this.appService.myComponent(data);
    this.dashboardService.changes();
    var header = "Wortschatz"
    this.appService.myHeader(header);
  }

  itemclick(item) {


    //dummy values for the moment, delete later - change out with actual database request result
    if(item[0] == 'Wortschatz'){
      this.dummyList = [['Tiere', 'task'],['Schulutensilien', 'task'],['Musikinstrumente', 'task']]
    }
    else if(item[0] == 'Tiere'){
      this.goToGame()
    }
    else {
      this.dummyList = [[item[0] + ' 1', 'task'],[item[0] + ' 2', 'task'],[item[0] + ' 3', 'task']]
    }
  }

}
