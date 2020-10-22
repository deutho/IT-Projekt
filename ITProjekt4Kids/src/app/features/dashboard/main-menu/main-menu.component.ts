import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit {

  constructor() { }

  dummyList = ['Wortschatz', 'Verbklammern', 'Satzstellung']
  creating = false;
  ngOnInit(): void {
  }

  addElement() {
    this.creating = true;
  }

  submit() {
    if((<HTMLInputElement>document.getElementById('newElement')).value != ''){
      this.dummyList.push((<HTMLInputElement>document.getElementById('newElement')).value);
    }
    
    (<HTMLInputElement>document.getElementById('newElement')).value = '';
    this.creating = false;
  }

}
