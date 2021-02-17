import { Component, HostListener, OnInit } from '@angular/core';
import { Navigation } from '@angular/router';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    history.pushState(null, "");
  }



}
