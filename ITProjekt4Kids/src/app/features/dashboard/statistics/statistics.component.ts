import { Component, HostListener, OnInit } from '@angular/core';
import { Navigation } from '@angular/router';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  constructor(private app: AppService) { }

  ngOnInit(): void {
    this.app.myHeader("Statistik");
  }



}
