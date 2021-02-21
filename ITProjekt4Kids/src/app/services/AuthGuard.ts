import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

    constructor(private auth: AuthService, private router: Router) {}

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (this.auth.isAuthenticated()) {
            return true;
        }

        //navigate to the login page if not logged in (Attach the calledURL to the redirect)
        let url: string = state.url;
        
        if (url != '/') this.router.navigate(['login'], {queryParams:{'redirectURL': state.url}});
        else this.router.navigate(['login']);
        return false;
    }
}