import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/users.model';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { VerbPositionGame } from 'src/app/models/VerbPositionGame.model';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import { AppService } from 'src/app/services/app.service';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-verb-position-game',
  templateUrl: './verb-position-game.component.html',
  styleUrls: ['./verb-position-game.component.css']
})
export class VerbPositionGameComponent implements OnInit {
  
  constructor(private afs: FirestoreDataService, private appService: AppService, private nav: NavigationService) {
    this.appService.myGameData$.subscribe((data) => {
      this.folderID = data;
    });
   }

   finito: boolean = false
   Games: VerbPositionGame[] = []
   currentUser: User;
   currentGame: VerbPositionGame
   folderID;
   sentence: string[] = []
   evaluated = false;
   answerIsCorrect = false;
   loaded = false; 
   roundsWon = 0;
   roundsLost = 0;
   totalNumberOfRounds = 0;
   finished = false;
   speakerMode = false;
   imageURL = "";
   correct: string[] = []
   roundsWonAnimation = [];
   roundsLostAnimation = [];
   noQuestionsInGame = false;

  async ngOnInit(): Promise<void> {
    await this.afs.getCurrentUser().then(data => this.currentUser = data[0]);
    await this.afs.getTasksPerID(this.folderID).then(data => this.Games = data);
    this.sentence = [];
    this.loadNextGame();
    this.totalNumberOfRounds = this.Games.length+1;
  }
    
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.sentence, event.previousIndex, event.currentIndex); 
    this.capitalizeFirst();
    this.point();
  }

  loadNextGame() {
    this.evaluated = false;
    if (this.Games.length > 0) {
        this.currentGame = this.Games.pop();      
        // console.log(this.currentGame)         
        this.sentence = [];
        for(let i = 0; i < this.currentGame.words.length; i++){
          if(this.currentGame.words[i] != "undefined") this.sentence.push(this.currentGame.words[i])   
        }

        console.log('sentence: ' + this.sentence)
        this.correct = this.sentence.slice();
        this.shuffleArray(this.sentence); 
        this.capitalizeFirst();
        this.point();
        this.loaded = true;
        this.answerIsCorrect = false;
        this.imageURL = this.currentGame.photoID;
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
      this.capitalizeFirst();
      this.point();
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
    wordPluspoint = wordPluspoint + "."
    this.sentence[this.sentence.length-1] = wordPluspoint   
  }

  finishGame() {
    if(this.totalNumberOfRounds > 0){
      this.finished = true;
      this.finalScreen()
    }else{
      this.noQuestionsInGame = true;
      console.log("no questions included")
    }
  }

  switchMode() {
    this.loaded = false;
    this.speakerMode = !this.speakerMode;
    this.loaded = true;
  }

  happyFace() {
    if((this.totalNumberOfRounds - this.roundsWon) < (this.totalNumberOfRounds / 2) ) {
      return true; //more than 50% correct
    }
    else return false;
  }

  goBack() {
    this.nav.navigate("Startseite", "mainMenu");
  }

  finalScreen() {
    this.roundsWonAnimation = [].constructor(this.roundsWon);
    this.roundsLostAnimation = [].constructor(this.totalNumberOfRounds - this.roundsWon);
  }

}
