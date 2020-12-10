import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/users.model';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { VerbPositionGame } from 'src/app/models/VerbPositionGame.model';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-verb-position-game',
  templateUrl: './verb-position-game.component.html',
  styleUrls: ['./verb-position-game.component.css']
})
export class VerbPositionGameComponent implements OnInit {

  constructor(private afs: FirestoreDataService, private appService: AppService) { }

  ngOnInit(): void {
  }

  Games: VerbPositionGame[] = []
  currentUser: User;
  currentGame: VerbPositionGame
  folderID;
  answers: string[]
  evaluated = false;
  finished = false;
  answerIsCorrect = false;
  loaded = false; 

    sentence = [
      "die Banane",
      "der Affe",
      "schält"
    ];

    correct = ["der Affe", "schält", "die Banane"];

    showAnswer = false;
  
    drop(event: CdkDragDrop<string[]>) {
      moveItemInArray(this.sentence, event.previousIndex, event.currentIndex);
    }
}
