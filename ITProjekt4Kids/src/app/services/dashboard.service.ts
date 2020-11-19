import { Injectable, ViewContainerRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MainMenuComponent } from '../features/dashboard/main-menu/main-menu.component';
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

  private vocabularGame() {
    return () =>
    import('../features/games/vocabulary-game/vocabulary-game.component').then(
      m => m.VocabularyGameComponent
    );
  }

  private vocabularGameEdit() {
    return () =>
    import('../features/games/vocabulary-game-edit/vocabulary-game-edit.component').then(
      m => m.VocabularyGameEditComponent
    );
  }

  private personalFormGame() {
    return () =>
    import('../features/games/personal-forms-game/personal-forms-game.component').then(
      m => m.PersonalFormsGameComponent
    );
  }

  private personalFormGameEdit() {
    return () =>
    import('../features/games/personal-forms-game-edit/personal-forms-game-edit.component').then(
      m => m.PersonalFormsGameEditComponent
    );
  }

  private bugReport() {
    return () =>
    import('../features/dashboard/bug-report/bug-report.component').then(
      m => m.BugReportComponent
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
    } else if (this.data == "vocabular-game") {
        return this.appService.forChild(vcr, {
          loadChildren: this.vocabularGame()
        });
    } else if (this.data == "vocabular-game-edit") {
      return this.appService.forChild(vcr, {
        loadChildren: this.vocabularGameEdit()
      });
    } else if (this.data == "personal-forms-game") {
        return this.appService.forChild(vcr, {
          loadChildren: this.personalFormGame()
        });
    } else if (this.data == "personal-forms-game-edit") {
      return this.appService.forChild(vcr, {
        loadChildren: this.personalFormGameEdit()
      });
    } else if (this.data == "bug-report") {
      return this.appService.forChild(vcr, {
        loadChildren: this.bugReport()
      });
    }
  }
}
