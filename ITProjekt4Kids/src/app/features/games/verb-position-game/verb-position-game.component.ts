import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/users.model';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { VerbPositionGame } from 'src/app/models/VerbPositionGame.model';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import { AppService } from 'src/app/services/app.service';
import { convertCompilerOptionsFromJson } from 'typescript';
import { last } from 'rxjs/operators';

@Component({
  selector: 'app-verb-position-game',
  templateUrl: './verb-position-game.component.html',
  styleUrls: ['./verb-position-game.component.css']
})
export class VerbPositionGameComponent implements OnInit {

  constructor(private afs: FirestoreDataService, private appService: AppService) { }

  ngOnInit(): void {
    this.shuffleArray(this.sentence)
    this.loadNextGame();
    this.totalNumberOfRounds = this.Games.length+1; 
  }

  Games: VerbPositionGame[] = []
  currentUser: User;
  currentGame: VerbPositionGame
  folderID;
  // sentence: string[]
  evaluated = false;
  answerIsCorrect = false;
  loaded = false; 
  roundsWon = 0;
  roundsLost = 0;
  totalNumberOfRounds = 0;
  finished = false;
  speakerMode = false;

    sentence = ["Der Affe", "schält", "die Banane"]
    sentence2 = ["Der Affe", "spielt", "mit der Gitarre"]

    // VerbPositionGame = [this.sentence, this.sentence2]
    correct = this.sentence.slice();
    
    drop(event: CdkDragDrop<string[]>) {
      moveItemInArray(this.sentence, event.previousIndex, event.currentIndex); 
      this.capitalizeFirst();
      this.point();
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

    evaluateGame(){
      var Result = []
      var wordId = []
      //return all ponints of words, which where added before
      for(var i = 0; i < this.correct.length; i++){
        var word = this.correct[i]

          if(word.includes(".")){
            word = word.substr(0, word.length - 1)
          }
          this.correct[i] = word
      }

      //add point to last word
      var lastWord = this.correct[this.correct.length-1] + "."
      this.correct[this.correct.length-1] = lastWord

      for(let i = 0; i < this.sentence.length; i++) {
        let word = (<HTMLElement>document.getElementById('word' + i))
        wordId[i] = word
      }
    
      //generate a dynamic sentence evaluation
      for(let i = 0; i < this.sentence.length; i++){
        
        if (wordId[i].innerText == this.correct[i]) {
          wordId[i].setAttribute("style","background-color:#52FF82;")
          console.log("word " + i + " richtig")
          Result[i] = "richtig";
        }else {
          wordId[i].setAttribute("style", "background-color:#FF7171;")
          console.log("word " + i + " falsch")
          Result[i] = "falsch";
        }
      }

      let tempAnswerChecker = true;

      for( let i in Result) {
        if(Result[i] == "falsch") tempAnswerChecker = false;
      }

      if(tempAnswerChecker == true){
        this.answerIsCorrect = true;
        if(!this.evaluated) this.roundsWon++;
      //Stimme "Du hast das Toll gemacht!" einfügen
      }else{
        if(!this.evaluated) this.roundsLost++;
        //Stimme "Oje, probier es noch einmal, du schaffst das!"
      }
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

    //uppercase first letter of the first box
    capitalizeFirst() {
      var capitalizeFirstLetter = this.sentence[0]
      capitalizeFirstLetter =  capitalizeFirstLetter.charAt(0).toUpperCase() + capitalizeFirstLetter.slice(1)
      this.sentence[0] = capitalizeFirstLetter

      //change all other first letters of words to lowercase
      for(var i = 1; i < this.sentence.length; i++){
        var word = this.sentence[i]
        word = word.charAt(0).toLowerCase() + word.slice(1)
        this.sentence[i] = word
      }
    }

    //set dynamic point to the end of the sentence
    point(){
       for(var i = 0; i < this.sentence.length; i++){
          var word = this.sentence[i]
          if(word.includes(".")){
            word = word.substr(0, word.length - 1)
          }
          this.sentence[i] = word
       }
      var wordPluspoint = this.sentence[this.sentence.length-1]
      console.log(wordPluspoint)
      wordPluspoint = wordPluspoint + "."
      this.sentence[this.sentence.length-1] = wordPluspoint   
    }

  finishGame() {
    console.log("fertig");
    this.finished = true;
  }

  switchMode() {
    this.loaded = false;
    this.speakerMode = !this.speakerMode;
    this.loaded = true;
    // this.updateColorhelper();
  }

}
