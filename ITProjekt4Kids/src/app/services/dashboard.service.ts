import { Injectable, ViewContainerRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppService } from '../services/app.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {

    public data = "";
    private hasChanged = new BehaviorSubject(false);
    hasChanged$ = this.hasChanged.asObservable();

  constructor(private appService: AppService) {
      this.appService.myComponent$.subscribe((data) => {
        this.data = data;
      })
  }

  private statistics() {
    return () =>
      import('../features/dashboard/statistics/statistics.component').then(
        m => m.StatisticsComponent
      );
  }

  private profile() {
    return () =>
      import('../features/dashboard/profile/profile.component').then(
        m => m.ProfileComponent
      );
  }

  private addUser() {
    return () =>
      import('../features/dashboard/add-user/add-user.component').then(
        m => m.AddUserComponent
      );
  }

  private mainMenu() {
    return () =>
      import('../features/dashboard/main-menu/main-menu.component').then(
        m => m.MainMenuComponent
      );
  }

  changes() {
    this.hasChanged.next(!this.hasChanged);
  }

  loadComponent(vcr: ViewContainerRef) {
    vcr.clear();

    if (this.data == "profile") {

         return this.appService.forChild(vcr, {
         loadChildren: this.profile()
        });
    } else if (this.data == "addUser") {
        return this.appService.forChild(vcr, {
        loadChildren: this.addUser()    
        });
    } else if (this.data == "statistics") {
        return this.appService.forChild(vcr, {
        loadChildren: this.statistics()    
        });
    } else if (this.data == "mainMenu") {
        return this.appService.forChild(vcr, {
          loadChildren: this.mainMenu()
        });
    }

  }
}
