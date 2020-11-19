import { Component, OnInit } from '@angular/core';
import {CdkDragDrop, copyArrayItem, DragDropModule, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { PersonalFormsGame } from 'src/app/models/PersonalFormsGame.model';
import { supportsPassiveEventListeners } from '@angular/cdk/platform';

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
  currentGame1 = new PersonalFormsGame("1","Ordne zu!","gehe","gehst","geht","gehen","geht","gehen","folder")
  currentGame2 = new PersonalFormsGame("1","Frage Nummer 2", "sehe","siehst","sieht","sehen","seht","sehen","folder")
  answers: string[]
  evaluated = false;
  finished = false;

  // boolean to detect if list already contains a string
  listOneEmpty = true;
  listTwoEmpty = true;
  listThreeEmpty = true;
  listFourEmpty = true;
  listFiveEmpty = true;
  listSixEmpty = true;

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
      //list is full, don't insert
      if(event.container.data.length > 0 && event.container.id != "selection") {}
      
      else{
        // insert
        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);

        if(event.container.id == "selection") {
          let index = event.container.data.indexOf("", 0);
          if(index != -1 && event.currentIndex > index) {
            let temp = this.answers[event.currentIndex]
            this.answers[event.currentIndex] = this.answers[index]
            this.answers[index] = temp
            this.answers.pop()
          }
          else if(index != -1) {
            this.answers.pop()
          } 
        }

        if(event.container.data[0] == "") {
          event.container.data.pop()
          event.previousContainer.data.push("")
        }
        else{          

          if(event.previousContainer.id == "selection"){
            this.answers.push("")
          }
            

          if(event.previousContainer.id == "listOne") {
            this.listOneEmpty = true;
          }
          if(event.container.id == "listOne") {
            this.listOneEmpty = false;
          }
          if(event.previousContainer.id == "listTwo") {
            this.listTwoEmpty = true;
          }
          if(event.container.id == "listTwo") {
            this.listTwoEmpty = false;
          }
          if(event.previousContainer.id == "listThree") {
            this.listThreeEmpty = true;
          }
          if(event.container.id == "listThree") {
            this.listThreeEmpty = false;
          }
          if(event.previousContainer.id == "listFour") {
            this.listFourEmpty = true;
          }
          if(event.container.id == "listFour") {
            this.listFourEmpty = false;
          }
          if(event.previousContainer.id == "listFive") {
            this.listFiveEmpty = true;
          }
          if(event.container.id == "listFive") {
            this.listFiveEmpty = false;
          }
          if(event.previousContainer.id == "listSix") {
            this.listSixEmpty = true;
          }
          if(event.container.id == "listSix") {
            this.listSixEmpty = false;
          }
        }
      }
    }
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

    this.evaluated = false;

    if (this.Games.length > 0) {
        this.currentGame = this.Games.pop();
        this.shuffleAnswers();        
    }
  }

  evaluateGame(){

    var correctAnswers = [this.currentGame.ich, this.currentGame.du, this.currentGame.erSieEs, this.currentGame.wir, this.currentGame.ihr, this.currentGame.sie];

     var Result = []
    
     let ich = (<HTMLElement>document.getElementById('box1'))
     let du = (<HTMLElement>document.getElementById('box2'))
     let erSieEs = (<HTMLElement>document.getElementById('box3'))
     let wir = (<HTMLElement>document.getElementById('box4'))
     let ihr = (<HTMLElement>document.getElementById('box5'))
     let sie = (<HTMLElement>document.getElementById('box6'))

     if (ich.innerText == correctAnswers[0]) {
       Result[0] = "richtig";
       ich.setAttribute("style","background-color:#52FF82;")
     }
     else {
      Result[0] = "falsch";
      ich.setAttribute("style", "background-color:#FF7171;")
     }

     if (du.innerText == correctAnswers[1]) {
      Result[1] = "richtig";
      du.setAttribute("style","background-color:#52FF82;")
    }
    else {
     Result[1] = "falsch";
     du.setAttribute("style", "background-color:#FF7171;")
    }

    if (erSieEs.innerText == correctAnswers[2]) {
      Result[2] = "richtig";
      erSieEs.setAttribute("style","background-color:#52FF82;")
    }
    else {
     Result[2] = "falsch";
     erSieEs.setAttribute("style", "background-color:#FF7171;")
    }

    if (wir.innerText == correctAnswers[3]) {
      Result[3] = "richtig";
      wir.setAttribute("style","background-color:#52FF82;")
    }
    else {
     Result[3] = "falsch";
     wir.setAttribute("style", "background-color:#FF7171;")
    }

    if (ihr.innerText == correctAnswers[4]) {
      Result[4] = "richtig";
      ihr.setAttribute("style","background-color:#52FF82;")
    }
    else {
     Result[4] = "falsch";
     ihr.setAttribute("style", "background-color:#FF7171;")
    }

    if (sie.innerText == correctAnswers[5]) {
      Result[5] = "richtig";
      sie.setAttribute("style","background-color:#52FF82;")
    }
    else {
     Result[5] = "falsch";
     sie.setAttribute("style", "background-color:#FF7171;")
    }

    this.evaluated = true;
     
    //  for(var i = 0; i <= 5; i++){
    //    if(correctAnswers[i] == Answers[i].toString()){
    //      Result[i] = "richtig";
    //    }else{
    //      Result[i] = "falsch";
    //    }
    //  }
  }

  nextOne() {
    this.loadNextGame();  
    (<HTMLElement>document.getElementById('box1')).setAttribute("style", "background-color:white;");
    (<HTMLElement>document.getElementById('box2')).setAttribute("style", "background-color:white;");
    (<HTMLElement>document.getElementById('box3')).setAttribute("style", "background-color:white;");
    (<HTMLElement>document.getElementById('box4')).setAttribute("style", "background-color:white;");
    (<HTMLElement>document.getElementById('box5')).setAttribute("style", "background-color:white;");
    (<HTMLElement>document.getElementById('box6')).setAttribute("style", "background-color:white;");
  }
}
