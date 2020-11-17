import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { AppService } from 'src/app/services/app.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';

@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.css']
})
export class RedirectComponent implements OnInit {

  redirectionUser;
  userAsString
  data: string[] = []
  uid;
  path;
  item;

  constructor(private app: AppService, private router: Router, private afs: FirestoreDataService, private activatedRoute: ActivatedRoute) {

  console.log(this.activatedRoute);
  this.uid = this.activatedRoute.snapshot.queryParamMap.get('user');
  this.path = this.activatedRoute.snapshot.queryParamMap.get('path');
  this.item = JSON.parse(this.activatedRoute.snapshot.queryParamMap.get('item'));

  }
  

  async ngOnInit() {
  
  await this.afs.getUserPerID(this.uid).valueChanges().pipe(take(1)).toPromise().
    then(data => {
      this.redirectionUser = data[0];
      this.userAsString = this.redirectionUser.firstname + " " + this.redirectionUser.lastname;
    });
    
  
  this.data[0] = this.userAsString;
  this.data[1] = this.path;
  this.data[2] = this.item;
  console.log(this.data);
  this.app.myRedirectData(this.data);
  
  this.router.navigate(['']);

  }
}
