import {
    Injectable,
    ComponentFactoryResolver,
    ViewContainerRef
  } from '@angular/core';
  import { BehaviorSubject, from, Observable, Subject } from 'rxjs';
  
  export interface ComponentLoader {
    loadChildren: () => Promise<any>;
  }
  
  @Injectable({
    providedIn: 'root'
  })
  export class AppService {

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
    myLastPath$: Observable<string[]>;
    private myLastPathSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);


    constructor(private cfr: ComponentFactoryResolver) {
        this.myheader$ = this.myHeaderSubject.asObservable();
        this.myGameData$ = this.myGameDataSubject.asObservable();
        this.myRedirect$ = this.myRedirectSubject.asObservable();
        this.myImageURL$ = this.myImageURLSubject.asObservable();
        this.myStudentMode$ = this.myStudentModeSubject.asObservable();
        this.myLastPath$ = this.myLastPathSubject.asObservable();
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

    myLastPath(data) {
      this.myLastPathSubject.next(data);
    }

  }