import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/services/app.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  authstatusSubscription;
  isAuthenticated;

  constructor(private router: Router, private app: AppService, private auth: AuthService) { }

  ngOnInit(): void {

    this.app.myHeader("Oje");
    this.authstatusSubscription = this.auth.currentAuthStatus.subscribe(authstatus => this.isAuthenticated = authstatus)
  }


  goBack() {
    this.router.navigate(['app/ ']);
  }

}
