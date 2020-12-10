import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';

@Component({
  selector: 'app-verb-position-game-edit',
  templateUrl: './verb-position-game-edit.component.html',
  styleUrls: ['./verb-position-game-edit.component.css']
})
export class VerbPositionGameEditComponent implements OnInit {

  constructor(private afs: FirestoreDataService, private appService: AppService) { }

  ngOnInit(): void {
  }

}
