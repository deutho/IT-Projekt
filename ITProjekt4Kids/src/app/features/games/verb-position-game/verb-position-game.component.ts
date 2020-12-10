import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/users.model';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-verb-position-game',
  templateUrl: './verb-position-game.component.html',
  styleUrls: ['./verb-position-game.component.css']
})
export class VerbPositionGameComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  Games: VerbPositionGameComponent[] = []
  currentUser: User;
  currentGame: VerbPositionGameComponent
  folderID;
  answers: string[]
  evaluated = false;
  finished = false;
  allItemsAllocated = false;
  answerIsCorrect = false;
  loaded = false; 

    words = [
      'die Banane!!',
      'der Affe',
      'schält'
    ];

    correct = ["der Affe", "schält", "die Banane"];

    showAnswer = false;
  
    drop(event: CdkDragDrop<string[]>) {
      moveItemInArray(this.words, event.previousIndex, event.currentIndex);
    }





}
