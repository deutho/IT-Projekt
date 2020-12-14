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

    sentence = ["der Affe", "schält", "die Banane"];

    word1 = ["der Affe"];
    word2 = ["schält"];
    word3 = ["die Banane"];
    
    correct = ["der Affe", "schält", "die Banane"];

    showAnswer = false;
  
    drop(event: CdkDragDrop<string[]>) {
      this.shuffleArray(this.sentence)
      moveItemInArray(this.sentence, event.previousIndex, event.currentIndex);
    }

    evaluateGame(){
      var Result = []
      let word1 = (<HTMLElement>document.getElementById('word1'))
      let word2 = (<HTMLElement>document.getElementById('word2'))
      let word3 = (<HTMLElement>document.getElementById('word3'))
      let word4 = (<HTMLElement>document.getElementById('word4'))
      let word5 = (<HTMLElement>document.getElementById('word5'))

      if (word1.innerText == this.correct[0]) {
        word1.setAttribute("style","background-color:#52FF82;")
        Result[0] = "richtig";
      }else {
        word1.setAttribute("style", "background-color:#FF7171;")
        Result[0] = "falsch";
      }

       if (word2.innerText == this.correct[1]) {
         word2.setAttribute("style","background-color:#52FF82;")
         Result[1] = "richtig";
       }else {
         word2.setAttribute("style", "background-color:#FF7171;")
         Result[1] = "falsch";
       }

      if (word3.innerText == this.correct[2]) {
         word3.setAttribute("style","background-color:#52FF82;")
         Result[2] = "richtig";
       }else {
         word3.setAttribute("style", "background-color:#FF7171;")
         Result[2] = "falsch";
       }

      let tempAnswerChecker = true;

      for( let i in Result) {
        if(Result[i] == "falsch") tempAnswerChecker = false;
      }

      if(tempAnswerChecker == true) this.answerIsCorrect = true;
      //Stimme "Du hast das Toll gemacht!" einfügen
      this.evaluated = true;
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
          console.log(this.currentGame)         

          this.shuffleArray(this.sentence); 
          this.loaded = true;
          this.answerIsCorrect = false;
      }
      else {
        this.finishGame() 
      }
    }

  finishGame() {
    console.log("fertig");
  }



}
