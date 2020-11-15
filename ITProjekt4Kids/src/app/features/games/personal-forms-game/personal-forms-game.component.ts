import { Component, OnInit } from '@angular/core';
import {CdkDragDrop, copyArrayItem, DragDropModule, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { PersonalFormsGame } from 'src/app/models/PersonalFormsGame.model';

@Component({
  selector: 'app-personal-forms-game',
  templateUrl: './personal-forms-game.component.html',
  styleUrls: ['./personal-forms-game.component.css']
})
export class PersonalFormsGameComponent implements OnInit {

  constructor() { }

  test = "Hallo Welt!"
  Games: PersonalFormsGame[] = []
  currentGame: PersonalFormsGame
  currentGame1 = new PersonalFormsGame("1","gehe","gehst","geht","gehen","geht","gehen","folder")
  currentGame2 = new PersonalFormsGame("1","sehe","siehst","sieht","sehen","seht","sehen","folder")
  answers: string[]
  listOneEmpty = true;
  Person = [
    {value:'ich', disabled: true},
    {value:'du', disabled: true},
    {value:'er/sie/es', disabled: true},
    {value:'wir', disabled: true},
    {value:'ihr', disabled: true},
    {value:'sie', disabled: true},
  ];

  items1 = [];
  items2 = [];
  items3 = [];
  items4 = [];
  items5 = [];
  items6 = [];

  ngOnInit(): void {
    this.Games.push(this.currentGame1)
    this.Games.push(this.currentGame2)
    this.shuffleArray(this.Games)
    this.loadNextGame()
  }

  canDrop() {
    return false;
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      if(event.container.data.length > 0 && event.container.id != "selection") {}
      else{
        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);
        this.listOneEmpty = false;
      }
    }
  }

  switchAcceptDrop() {

  }

  showList() {
    console.log(this.answers);
  }

  shuffleAnswers() {
    this.answers = [
      this.currentGame.ich,
      this.currentGame.du,
      this.currentGame.erSieEs,
      this.currentGame.wir,
      this.currentGame.ihr,
      this.currentGame.sie,
    ];
    this.shuffleArray(this.answers);
  }

  shuffleArray(arr) {
    var currentIndex = arr.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = arr[currentIndex];
        arr[currentIndex] = arr[randomIndex];
        arr[randomIndex] = temporaryValue;
    }

  }

  loadNextGame() {

    if (this.Games.length > 0) {
        this.currentGame = this.Games.pop();
        this.shuffleAnswers();        
        //this.loaded = true;     
    }
  }

}
