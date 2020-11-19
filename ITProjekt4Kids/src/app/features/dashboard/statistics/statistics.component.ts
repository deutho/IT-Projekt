import { Component, HostListener, OnInit } from '@angular/core';
import { Navigation } from '@angular/router';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  constructor(private nav: NavigationService) { }

  ngOnInit(): void {
    history.pushState(null, "");
  }


  @HostListener('window:popstate', ['$event'])
  onBrowserBackBtnClose(event: Event) {
    event.preventDefault();
    this.nav.navigate('Hauptmenü', 'mainMenu');
  }

}
