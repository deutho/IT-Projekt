import {
    Injectable,
    ComponentFactoryResolver,
    ViewContainerRef
  } from '@angular/core';
  import { BehaviorSubject, from, Observable, Subject } from 'rxjs';
  import { map } from 'rxjs/operators';
import { DashboardService } from './dashboard.service';
  
  export interface ComponentLoader {
    loadChildren: () => Promise<any>;
  }
  
  @Injectable({
    providedIn: 'root'
  })
  export class AppService {

    myComponent$: Observable<any>;
    private myMethodSubject = new Subject<any>();
    myheader$: Observable<any>;
    private myHeaderSubject = new Subject<any>();
    myGameData$: Observable<any>;
    private myGameDataSubject: BehaviorSubject<any> = new BehaviorSubject<any>([])
    myRedirect$: Observable<any>;
    private myRedirectSubject: BehaviorSubject<any> = new BehaviorSubject<any>([]);
    myImageURL$: Observable<any>;
    private myImageURLSubject: BehaviorSubject<any> = new BehaviorSubject<any>([]);
    myStudentMode$: Observable<any>;
    private myStudentModeSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


    constructor(private cfr: ComponentFactoryResolver) {
        this.myComponent$ = this.myMethodSubject.asObservable();
        this.myheader$ = this.myHeaderSubject.asObservable();
        this.myGameData$ = this.myGameDataSubject.asObservable();
        this.myRedirect$ = this.myRedirectSubject.asObservable();
        this.myImageURL$ = this.myImageURLSubject.asObservable();
        this.myStudentMode$ = this.myStudentModeSubject.asObservable();
    }
  
    forChild(vcr: ViewContainerRef, cl: ComponentLoader) {
      return from(cl.loadChildren()).pipe(
        map((component: any) => this.cfr.resolveComponentFactory(component)),
        map(componentFactory => vcr.createComponent(componentFactory))
      );
    }

    myComponent(data) {
        this.myMethodSubject.next(data);
    }

    myHeader(data) {
      this.myHeaderSubject.next(data);
    }

    myGameData(data) {
      this.myGameDataSubject.next(data);
    }

    myRedirectData(data) {
      this.myRedirectSubject.next(data);
    }
    
    myImageURL(data) {
      this.myImageURLSubject.next(data);
    }

    myStudentMode() {
      this.myStudentModeSubject.next(!this.myStudentModeSubject.value)
    }


  }