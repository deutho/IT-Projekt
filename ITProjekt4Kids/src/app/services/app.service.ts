import {
    Injectable,
    ComponentFactoryResolver,
    ViewContainerRef
  } from '@angular/core';
  import { BehaviorSubject, from, Observable, Subject } from 'rxjs';
  import { map } from 'rxjs/operators';
  
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
    myImageURL$: Observable<any>;
    private myImageURLSubject: BehaviorSubject<any> = new BehaviorSubject<any>([]);

    constructor(private cfr: ComponentFactoryResolver) {
        this.myComponent$ = this.myMethodSubject.asObservable();
        this.myheader$ = this.myHeaderSubject.asObservable();
        this.myGameData$ = this.myGameDataSubject.asObservable();
        this.myImageURL$ = this.myImageURLSubject.asObservable();
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

    myImageURL(data) {
      this.myImageURLSubject.next(data);
    }
  }