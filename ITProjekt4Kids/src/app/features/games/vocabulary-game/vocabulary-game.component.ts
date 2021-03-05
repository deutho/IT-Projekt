import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/internal/operators/take';
import { VocabularyGame } from 'src/app/models/VocabularyGame.model';
import { User } from 'src/app/models/users.model';
import { AppService } from 'src/app/services/app.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { textChangeRangeIsUnchanged } from 'typescript';
import { Folder } from 'src/app/models/folder.model';
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
  selector: 'app-vocabulary-game',
  templateUrl: './vocabulary-game.component.html',
  styleUrls: ['./vocabulary-game.component.css'],
  animations: [starAnimation]
})
export class VocabularyGameComponent implements OnInit, OnDestroy {

  Games: VocabularyGame[];
  currentGame: VocabularyGame;
  currentUser: User;
  playedGames: VocabularyGame[];
  loaded = false;
  selection: string;
  answers: string[][];
  imageURL = "";
  response;
  evaluated = false;
  finished = false;
  roundsWon = 0;
  totalrounds = 0;
  folderID;
  folder: Folder;
  starttime: number;
  endtime: number;
  duration: number;
  speakerMode = false;
  totalNumberOfRounds = 0;
  audio = new Audio("");
  roundsWonAnimation = [];
  roundsLostAnimation = [];
  audioQuestion = new Audio();
  audioButton1 = new Audio();
  audioButton2 = new Audio();
  audioButton3 = new Audio();
  audioButton4 = new Audio();
  audioQuestionLoaded = false;
  audioButton1Loaded = false;
  audioButton2Loaded = false;
  audioButton3Loaded = false;
  audioButton4Loaded = false;
  imageLoaded = false;
  image = new Image();  
  noQuestionsInGame = false;
  teacherPlaying: boolean;
  dockey: string;
  studentmode = true;
  studentmodesubscription;

  
  constructor(private afs: FirestoreDataService, public router: Router, private appService: AppService, private route: ActivatedRoute) {}

  async ngOnInit(){

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

      //evaluate if teacher is playing
      if (this.currentUser.role == 2) this.teacherPlaying == true;

      //set the header
      this.appService.myHeader(this.folder.name);

      await this.afs.getTasksPerID(this.folderID).then(data => this.Games = data);

      this.shuffleArray(this.Games);

      this.audioQuestion.preload ="auto";
      this.audioButton1.preload = "auto";
      this.audioButton2.preload = "auto";
      this.audioButton3.preload = "auto";
      this.audioButton4.preload = "auto";





      this.starttime = Date.now();
      this.loadNextGame();
      this.totalNumberOfRounds = this.Games.length+1;
    }
    
      this.studentmodesubscription = this.appService.myStudentMode$.subscribe((data) => {
        if (this.currentUser.role == 2 && data != this.studentmode)
        this.router.navigate(['game/'+this.folderID], {queryParams:{k: this.dockey, t: 'vocabular-game'}, replaceUrl: true});
      });
    
  }



  updateColorhelper() {
    setTimeout(() => {      
      this.updateColor("button1");
      this.updateColor("button2");
      this.updateColor("button3");
      this.updateColor("button4");
      this.updateColor("question");
      // (<HTMLInputElement>document.getElementById('progressRange')).value = String(this.totalrounds+1);
    }) 
  }

  loadNextGame() {
    this.resetLoadedBooleans();
    this.evaluated = false;
    if (this.Games.length > 0) {
        this.currentGame = this.Games.pop();
        this.shuffleAnswers();        
        this.loadAudioSources();              
        this.image.addEventListener('load', (event) => {
          this.imageLoaded = true;
          this.checkIfContentIsLoaded();
        });
        this.image.src=this.imageURL;
        this.checkIfContentIsLoaded();
    }else {
      this.finishGames() 
    }
  }

  resetLoadedBooleans() {
    this.audioQuestionLoaded = false;
    this.audioButton1Loaded = false;
    this.audioButton2Loaded = false;
    this.audioButton3Loaded = false;
    this.audioButton4Loaded = false;
    this.imageLoaded = false;
  }

  loadAudioSources() {    
    this.audioQuestion.src = "";
    this.audioButton1.src = "";
    this.audioButton2.src = "";
    this.audioButton3.src = "";
    this.audioButton4.src = "";
    
    this.audioQuestion.src = this.currentGame.question[1];
    this.audioButton1.src = this.answers[0][1];
    this.audioButton2.src = this.answers[1][1];
    this.audioButton3.src = this.answers[2][1];
    this.audioButton4.src = this.answers[3][1];
    this.castEventListeners();
  }

  castEventListeners() {
    this.audioQuestion.addEventListener("canplaythrough", () => {
      this.audioQuestionLoaded = true;
      this.checkIfContentIsLoaded()
      console.log("audio question loaded")
    })
    this.audioButton1.addEventListener("canplaythrough", () => {
      this.audioButton1Loaded = true;
      this.checkIfContentIsLoaded()
      console.log("audio button1 loaded")
    })
    this.audioButton2.addEventListener("canplaythrough", () => {
      this.audioButton2Loaded = true;
      this.checkIfContentIsLoaded()
      console.log("audio button2 loaded")
    })
    this.audioButton3.addEventListener("canplaythrough", () => {
      this.audioButton3Loaded = true;
      this.checkIfContentIsLoaded()
      console.log("audio button3 loaded")
    })
    this.audioButton4.addEventListener("canplaythrough", () => {
      this.audioButton4Loaded = true;
      this.checkIfContentIsLoaded()
      console.log("audio button4 loaded")
    })
  }

  checkIfContentIsLoaded() {
    //if no audio files exist - they are set to true here
    if(this.currentGame.question[1] == "") this.audioQuestionLoaded = true;
    if(this.answers[0][1] == "") this.audioButton1Loaded = true;
    if(this.answers[1][1] == "") this.audioButton2Loaded = true;
    if(this.answers[2][1] == "") this.audioButton3Loaded = true;
    if(this.answers[3][1] == "") this.audioButton4Loaded = true;

    if( 
      // taken out atm to avoid long waiting between questions - has to be implementet better - will take alot of time
      // this.audioQuestionLoaded == true &&
      // this.audioButton1Loaded == true &&
      // this.audioButton2Loaded == true &&
      // this.audioButton3Loaded == true &&
      // this.audioButton4Loaded == true &&
      this.imageLoaded == true
      ) {
        this.loaded = true
        this.updateColorhelper();   
      }
    else this.loaded = false;
  }

  shuffleAnswers() {
    this.answers = [this.currentGame.answer1, this.currentGame.answer2, this.currentGame.answer3, this.currentGame.rightAnswer];
    if(this.currentGame.photoID == null){
      this.currentGame.photoID = "https://www.thermaxglobal.com/wp-content/uploads/2020/05/image-not-found.jpg"
    }
    this.imageURL = this.currentGame.photoID; //in the meantime set the URL
    if(this.imageURL == './../../../../assets/Images/Placeholder-Image/north_blur_Text.png') this.imageURL = './../../../../assets/Images/imageNotFound.jpg'
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

  finishGames() {
    if(this.totalNumberOfRounds > 0) {
      this.endtime = Date.now();
      this.duration = this.endtime-this.starttime;
      if(this.teacherPlaying == false) this.afs.createResult(this.currentUser.uid, this.totalrounds, this.roundsWon, this.folderID, this.duration);
      this.finished = true;
      this.finalScreen()
    }
    else this.noQuestionsInGame = true;

  }

  

  evaluateGame(selection) {
    let correctAnswer;
    // let s : String = (selection.toString() + ' ')
    if (selection == this.currentGame.rightAnswer[0] + ' ') {
      this.response = "Richtig!!";
      this.roundsWon++
      this.totalrounds++;
      correctAnswer = true;
    }else{
      this.response = "Falsch!";
      this.totalrounds++;
      correctAnswer = false;
    }
    this.evaluated = true;
    return correctAnswer;
  }


  nextOne() {
    this.loadNextGame();  
    (<HTMLInputElement>document.getElementById('button1')).setAttribute("style", "background-color:white;");
    (<HTMLInputElement>document.getElementById('button2')).setAttribute("style", "background-color:white;");
    (<HTMLInputElement>document.getElementById('button3')).setAttribute("style", "background-color:white;");
    (<HTMLInputElement>document.getElementById('button4')).setAttribute("style", "background-color:white;");
  }

  // readQuestion() {
  //   this.playSound(this.currentGame.question[1]);
  // }

  // readButtonOne() {
  //   this.playSound(this.answers[0][1]);
  // }

  // readButtonTwo() {
  //   this.playSound(this.answers[1][1]);
  // }

  // readButtonThree() {
  //   this.playSound(this.answers[2][1]);
  // }

  // readButtonFour() {
  //   this.playSound(this.answers[3][1]);
  // }

  buttonClicked(id : string) {
    if (this.speakerMode == false && this.evaluated == false) {
      this.checkAnswer(id);
    }
    else this.readButtonValue(id);
  }

  readButtonValue(id: string) {
    if(id == "question") {
      this.audioQuestion.play()
    }
    else if( id == "button1") {
      this.audioButton1.play()
    }
    else if( id == "button2") {
      this.audioButton2.play()
    }
    else if( id == "button3") {
      this.audioButton3.play()
    }    
    else if( id == "button4") {
      this.audioButton4.play()
    }
    
  }

  checkAnswer(id: string) {
    if(id == 'question') return;
    if(!this.evaluated) {
      let button = (<HTMLButtonElement>document.getElementById(id))
      let correctAnswer = this.evaluateGame(button.value);          
      if (correctAnswer) {
        button.setAttribute("style", "background-color:#52FF82;");
      }
      else {
        button.setAttribute("style", "background-color:#FF7171;");
        let button1 = (<HTMLButtonElement>document.getElementById('button1'))
        let button2 = (<HTMLButtonElement>document.getElementById('button2'))
        let button3 = (<HTMLButtonElement>document.getElementById('button3'))
        let button4 = (<HTMLButtonElement>document.getElementById('button4'))        
        if(button1.value == this.currentGame.rightAnswer[0]){
          button1.setAttribute("style", "background-color:#52FF82;");
        }
        else if(button2.value == this.currentGame.rightAnswer[0]){
          button2.setAttribute("style", "background-color:#52FF82;");
        }
        else if(button3.value == this.currentGame.rightAnswer[0]){
          button3.setAttribute("style", "background-color:#52FF82;");
        }
        else if(button4.value == this.currentGame.rightAnswer[0]){
          button4.setAttribute("style", "background-color:#52FF82;");
        }
      }
    }
  }

  updateColor(id) {
    var text = document.getElementById(id);
    var str = (<HTMLInputElement>text).value,
        reg = /red|blue|green/g; //g is to replace all occurances

    //fixing a bit
    var toStr = String(reg);
    var color = (toStr.replace('\/g', '|')).substring(1);

    //split it baby
    var colors = color.split("|");
    if(this.currentGame.coloring == undefined) this.currentGame.coloring = true;
    if(this.currentGame.coloring) {
      if (colors.indexOf("red") > -1) {
        // 
          str = str.replace(/\bdie(?=^|\s)/g, '<span style="color:red;" >die</span>');
      }

      if (colors.indexOf("blue") > -1) {
        // '<span style="color:blue;">der</span>'
          str = str.replace(/\bder(?=^|\s)/g, '<span style="color:blue;">der</span>');
      }

      if (colors.indexOf("green") > -1) {
        // style="color:green;"
          str = str.replace(/\bdas(?=^|\s)/g, '<span style="color:green;">das</span>');
      }

      if (colors.indexOf("red") > -1) {
        // style="color:red;"
        str = str.replace(/\bDie(?=^|\s)/g, '<span  style="color:red;">Die</span>');
      }

      if (colors.indexOf("blue") > -1) {
        // style="color:blue;"
          str = str.replace(/\bDer(?=^|\s)/g, '<span style="color:blue;">Der</span>');
      }

      if (colors.indexOf("green") > -1) {
        // style="color:green;"
          str = str.replace(/\bDas(?=^|\s)/g, '<span style="color:green;">Das</span>');
      }
    }

    document.getElementById(id).innerHTML = str;
  }  

  switchMode() {
    this.loaded = false;
    this.speakerMode = !this.speakerMode;
    this.loaded = true;
    this.updateColorhelper();
  }

  playSound(soundfile) {
    this.audio = new Audio(soundfile);
    this.audio.play();
  }

  finalScreen() {
    this.roundsWonAnimation = [].constructor(this.roundsWon);
    this.roundsLostAnimation = [].constructor(this.totalrounds - this.roundsWon);
  }

  happyFace() {
    
    if((this.totalrounds - this.roundsWon) < (this.totalrounds / 2) ) {
      return true; //more than 50% correct
    }
    else return false;
  }


  ngOnDestroy() {
    if (this.studentmodesubscription != undefined) this.studentmodesubscription.unsubscribe(); 
   }


}


