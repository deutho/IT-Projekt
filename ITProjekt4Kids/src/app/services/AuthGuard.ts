import { Injectable, OnDestroy } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import * as firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { map, take, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate{

    constructor(private auth: AuthService, private router: Router, private af: AngularFireAuth) {
    }

    //See: https://stackoverflow.com/questions/53294329/angular-browser-refresh-handling-in-authguard
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.af.authState
          .pipe(
            take(1),
            map(user => !!user),
            tap(
              loggedIn => {
                if (!loggedIn) {
                    let url: string = state.url;
                    if (url != '/') this.router.navigate(['login'], {queryParams:{'redirectURL': state.url}})
                    else this.router.navigate(['login']);
                }
              }
            )
          );
      }

}