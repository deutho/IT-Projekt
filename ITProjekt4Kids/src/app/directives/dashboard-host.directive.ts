import { Directive, ViewContainerRef } from '@angular/core';

@Directive({ selector: '[appProfileHost]' })
export class DashboardHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
