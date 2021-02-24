import {
    Injectable,
    ComponentFactoryResolver,
    ViewContainerRef
  } from '@angular/core';
  import { BehaviorSubject, from, Observable, ObservedValueOf, Subject } from 'rxjs';
import { User } from '../models/users.model';
  
  export interface ComponentLoader {
    loadChildren: () => Promise<any>;
  }
  
  @Injectable({
    providedIn: 'root'
  })
  export class AppService {

    myheader$: Observable<any>;
    private myHeaderSubject = new BehaviorSubject<String>("")
    myImageURL$: Observable<any>;
    private myImageURLSubject: BehaviorSubject<any> = new BehaviorSubject<any>([]);
    myStudentMode$: Observable<any>;
    private myStudentModeSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    
    constructor() {
        this.myheader$ = this.myHeaderSubject.asObservable();
        this.myImageURL$ = this.myImageURLSubject.asObservable();
        this.myStudentMode$ = this.myStudentModeSubject.asObservable();
    }

    myHeader(data) {
      this.myHeaderSubject.next(data);
    }

    getMyHeader(): Observable<any> {
      return this.myHeaderSubject.asObservable();
    }
    
    myImageURL(data) {
      this.myImageURLSubject.next(data);
    }

    myStudentMode() {
      this.myStudentModeSubject.next(!this.myStudentModeSubject.value)
    }
  }