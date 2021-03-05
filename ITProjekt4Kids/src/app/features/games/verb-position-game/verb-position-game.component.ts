import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from 'src/app/models/users.model';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { VerbPositionGame } from 'src/app/models/VerbPositionGame.model';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Folder } from 'src/app/models/folder.model';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
const starAnimation = trigger('starAnimation', [
  transition('* <=> *', [
    query(':enter',
      [style({ opacity: 0 }), stagger('200ms', animate('600ms ease-out', style({ opacity: 1 })))],
      { optional: true }
    ),
    query(':leave',
      animate('200ms', style({ opacity: 0 })),
      { optional: true}
    )
  ])
]);

@Component({
  selector: 'app-verb-position-game',
  templateUrl: './verb-position-game.component.html',
  styleUrls: ['./verb-position-game.component.css'],
  animations: [starAnimation]
})
export class VerbPositionGameComponent implements OnInit, OnDestroy {
  
  constructor(private afs: FirestoreDataService, private appService: AppService, private route: ActivatedRoute, private router: Router) {
   }

   finito: boolean = false
   Games: VerbPositionGame[] = []
   currentUser: User;
   folder: Folder;
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
   teacherPlaying: boolean;
   audio = new Audio("");
   wrongAnwserNotification: boolean = false;
   studentmode: boolean = true;
   dockey: string;
   studentmodesubscription;

  async ngOnInit(): Promise<void> {
    await this.afs.getCurrentUser().then(data => this.currentUser = data[0]);

    this.folderID = this.route.snapshot.paramMap.get('id');

    this.dockey = this.route.snapshot.queryParamMap.get('k');

    await this.afs.getFolderElement(this.dockey).then(data => {
      let f: Folder[]  = data.folders;
      f.forEach(folder => {
        if (folder.uid == this.folderID) this.folder = folder
      });
    }).catch(() => this.router.navigate(['notfound'], {replaceUrl: true}))

    if (this.folder == undefined) {
      this.router.navigate(['notfound'], {replaceUrl: true});
    } else {


      //set the header
      this.appService.myHeader(this.folder.name);

      //evaluate if teacher is playing
      if (this.currentUser.role == 2) this.teacherPlaying == true;

      await this.afs.getTasksPerID(this.folderID).then(data => this.Games = data);
      this.sentence = [];
      this.shuffleArray(this.Games)
      this.loadNextGame();
      this.totalNumberOfRounds = this.Games.length+1;
    }

    this.studentmodesubscription =this.appService.myStudentMode$.subscribe((data) => {
      if (this.currentUser.role == 2 && data != this.studentmode)
      this.router.navigate(['game/'+this.folderID], {queryParams:{k: this.dockey, t: 'verb-position-game'}, replaceUrl: false});
    });
  }
    
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.sentence, event.previousIndex, event.currentIndex); 
    this.capitalizeFirst();
    this.point();
    this.removeColor();
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
        
        this.correct = this.sentence.slice();
        this.shuffleArray(this.sentence); 
        this.capitalizeFirst();
        this.point();
        this.loaded = true;
        this.answerIsCorrect = false;
        this.imageURL = this.currentGame.photoID;
        if(this.imageURL == './../../../../assets/Images/Placeholder-Image/north_blur_Text.png') this.imageURL = './../../../../assets/Images/imageNotFound.jpg'
        this.removeColor()        
    }
    else {
      this.finishGame() 
    }
  }

  evaluateGame(){
    var Result = []
    var wordId = []
    this.wrongAnwserNotification = false;
    //return all ponints of words, which where added before
    for(var i = 0; i < this.correct.length; i++){
      var word = this.correct[i]

        if(word.includes(this.currentGame.punctuationType)){
          word = word.substr(0, word.length - 1)
        }
        this.correct[i] = word
    }

    //add point to last word
    var lastWord = this.correct[this.correct.length-1] + this.currentGame.punctuationType
    this.correct[this.correct.length-1] = lastWord
    this.correct[0] = this.correct[0].charAt(0).toUpperCase() + this.correct[0].substring(1, this.correct[0].length);

    for(let i = 0; i < this.sentence.length; i++) {
      let word = (<HTMLElement>document.getElementById('word' + i))
      wordId[i] = word
    }
    let temp = wordId[0].innerText;
    wordId[0].innerText = wordId[0].innerText.charAt(0).toUpperCase() + wordId[0].innerText.substring(1, wordId[0].innerText.length);
    //generate a dynamic sentence evaluation
    for(let i = 0; i < this.sentence.length; i++){
      
      if (wordId[i].innerText.replace(/\s\s+/g, ' ') == this.correct[i].replace(/\s\s+/g, ' ')) {
        wordId[i].setAttribute("style","background-color:#52FF82;")
        Result[i] = "richtig";
      }else {
        wordId[i].setAttribute("style", "background-color:#FF7171;")
        Result[i] = "falsch";
      }
    }
    wordId[0].innerText = temp;
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
    if(!this.answerIsCorrect) {
      this.wrongAnwserNotification = true;
    }
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
    if(this.currentGame.easyMode) return;
    var capitalizeFirstLetter = this.sentence[0]

    capitalizeFirstLetter =  capitalizeFirstLetter.charAt(0).toUpperCase() + capitalizeFirstLetter.slice(1)
    this.sentence[0] = capitalizeFirstLetter

    //change all other first letters of words to lowercase
    for(var i = 1; i < this.sentence.length; i++){
      for(var j = 0; j< this.currentGame.words.length; j++){
        if(this.currentGame.words[j].toLowerCase() == this.sentence[i].toLowerCase()) this.sentence[i] = this.currentGame.words[j]
      }      
    }
  }

  //set dynamic point to the end of the sentence
  point(){
    // remove punctuation from all words
    for(var i = 0; i < this.sentence.length; i++){
      var word = this.sentence[i]
      if(word.includes(this.currentGame.punctuationType)){
        word = word.substr(0, word.length - 1)
      }
      this.sentence[i] = word
    }
    // add point to correct word (last one)
    var wordPluspoint = this.sentence[this.sentence.length-1]
    wordPluspoint = wordPluspoint + this.currentGame.punctuationType
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
    this.diasableAndEnableHTMLAccordinglyWithSomeCSS();    
    this.loaded = true;
  }

  diasableAndEnableHTMLAccordinglyWithSomeCSS(){
    
    // CSS for Cursor
    const demoClasses = document.querySelectorAll('.example-box');
    if(this.speakerMode == true) {      
      demoClasses.forEach(element => {
        element.setAttribute("style", "cursor: pointer")
      });
    }
    else{
      demoClasses.forEach(element => {
        element.setAttribute("style", "cursor: move")
      });
    }
  }

  allowDrag(){
    if(this.speakerMode) return true;
    return false;
  }

  playSound(soundfile: string) {
    soundfile = soundfile.toLowerCase()
    if(soundfile.indexOf(this.currentGame.punctuationType) != -1) soundfile = soundfile.substr(0, soundfile.length-1)
    console.log(this.currentGame.question[1])
    if(this.speakerMode == false) return;
    interface keyMap {
      [key: string]: string;
    } 
    let answerMap:keyMap = {};
    answerMap[this.currentGame.question[0].toLowerCase()] = this.currentGame.question[1]
    for(var i = 0; i<this.currentGame.words.length; i++)
    {
      answerMap[this.currentGame.words[i].toLowerCase()] = this.currentGame.audio[i+1]
      
    }
    console.log(answerMap)
    this.audio = new Audio(answerMap[soundfile]);
    this.audio.play();
  }

  happyFace() {
    if((this.totalNumberOfRounds - this.roundsWon) < (this.totalNumberOfRounds / 2) ) {
      return true; //more than 50% correct
    }
    else return false;
  }

  finalScreen() {
    this.roundsWonAnimation = [].constructor(this.roundsWon);
    this.roundsLostAnimation = [].constructor(this.totalNumberOfRounds - this.roundsWon);
  }

  goBack() {
    this.router.navigate(['']);
  }

  removeColor(){
    for(let i = 0; i < this.sentence.length; i++) {
      let word = (<HTMLElement>document.getElementById('word' + i))
      if(word != null) word.setAttribute("style","background-color:#ffffff;")
      
    }    
  }

  ngOnDestroy() {
    if (this.studentmodesubscription != undefined) this.studentmodesubscription.unsubscribe(); 
   }

}
