import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { DashboardService } from './dashboard.service';







@Injectable({ providedIn: 'root' })
export class NavigationService {

constructor(private app: AppService, private dashboard: DashboardService) {}

navigate(header, data) {
    var data = data;
    this.app.myComponent(data);
    this.dashboard.changes();
    var header = header;
    this.app.myHeader(header);
  }    
}