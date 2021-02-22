import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/models/users.model';
import { AppService } from 'src/app/services/app.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';

@Component({
  selector: 'app-game-redirect',
  templateUrl: './game-redirect.component.html',
  styleUrls: ['./game-redirect.component.css']
})
export class GameRedirectComponent implements OnInit, OnDestroy {

  currentUser: User;
  studentMode: boolean;
  modesubscription;

  constructor(private route: ActivatedRoute, private router: Router, private afs: FirestoreDataService, private appService: AppService) { }

  async ngOnInit(): Promise<void> {
    let gameid: string = this.route.snapshot.paramMap.get('id');
    let dockey: string = this.route.snapshot.queryParamMap.get('k');
    let type: string = this.route.snapshot.queryParamMap.get('t');

    //get user
    await this.afs.getCurrentUser().then(data => this.currentUser = data[0]);

    this.modesubscription = this.appService.myStudentMode$.subscribe((studentMode) => {
      this.studentMode = studentMode;
    });

    this.redirect(gameid, dockey, type);
  }

  private redirect(gameid, dockey, type) {
    console.log(this.studentMode);
    if (this.currentUser.role == 3 || this.studentMode == true) this.router.navigate(['game/'+type+'/'+gameid], {queryParams:{k: dockey}, replaceUrl:true});
    else if (this.currentUser.role == 2) this.router.navigate(['game/'+type+'-edit/'+gameid], {queryParams:{k: dockey}, replaceUrl:true});
  }


  ngOnDestroy() {
    this.modesubscription.unsubscribe();
  }
}
