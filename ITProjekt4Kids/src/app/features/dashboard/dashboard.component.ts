import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DashboardHostDirective } from '../../directives/dashboard-host.directive';
import { DashboardService } from '../../services/dashboard.service';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';


@Component({
    selector: 'app-dashboard-container',
    template: `
      <ng-template appProfileHost></ng-template>
    `
})
export class DashboardComponent implements OnInit, OnDestroy {
    @ViewChild(DashboardHostDirective, {static: true})
    dashboardHost: DashboardHostDirective;
    private destroySubject = new Subject();

    constructor(private dashboardService: DashboardService) {}

    ngOnInit() {
        const viewContainerRef = this.dashboardHost.viewContainerRef;
        this.dashboardService.hasChanged$
        .pipe(
            takeUntil(this.destroySubject),
            mergeMap(hasChanged => this.dashboardService.loadComponent(viewContainerRef)
            )
        )   
        .subscribe();
    }

    ngOnDestroy() {
        this.destroySubject.next();
        this.destroySubject.complete();
    }

}
