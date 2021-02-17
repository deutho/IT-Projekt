import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { AppService } from 'src/app/services/app.service';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';

@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.css']
})
export class RedirectComponent implements OnInit {

  redirectionUser;
  data: string[] = []
  user: string;
  path;
  item;

  constructor(private app: AppService, private router: Router, private afs: FirestoreDataService, private activatedRoute: ActivatedRoute, private auth: AuthService) {

  console.log(this.activatedRoute);
  this.user = this.activatedRoute.snapshot.queryParamMap.get('user');
  this.path = this.activatedRoute.snapshot.queryParamMap.get('doc');
  this.item = this.activatedRoute.snapshot.queryParamMap.get('item');

  }
  

  async ngOnInit() {
    this.data[0] = this.user.substring(0, this.user.indexOf("-"))+" "+this.user.substring(this.user.indexOf("-")+1);
    this.data[1] = this.item;
    this.data[2] = this.path;
    
    sessionStorage.setItem("redirect-user", this.data[0]);
    sessionStorage.setItem("redirect-item", this.data[1]);
    sessionStorage.setItem("redirect-path", this.data[2]);
    this.router.navigate(['app']);
  }
}
