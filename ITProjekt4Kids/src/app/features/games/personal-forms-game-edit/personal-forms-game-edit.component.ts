import { Component, OnInit } from '@angular/core';
import {CdkDragDrop, CdkDropList, CDK_DROP_LIST, copyArrayItem, DragDropModule, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { AppService } from 'src/app/services/app.service';
import {v4 as uuidv4} from 'uuid';
import { PersonalFormsGame } from 'src/app/models/PersonalFormsGame.model';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import { take } from 'rxjs/operators';
import { User } from 'src/app/models/users.model';
import { RecordRTCService } from 'src/app/services/record-rtc.service';

@Component({
  selector: 'app-personal-forms-game-edit',
  templateUrl: './personal-forms-game-edit.component.html',
  styleUrls: ['./personal-forms-game-edit.component.css']
})
export class PersonalFormsGameEditComponent implements OnInit {
  
  folderUID;
  currentGame: PersonalFormsGame
  unsavedChanges = false;
  valueButton1: string;
  valueButton2: string;
  valueButton3: string;
  valueButton4: string;
  valueButton5: string;
  valueButton6: string;
  question: string;
  audioURLQuestion: string;
  audioURLAnswer1: string;
  audioURLAnswer2: string;
  audioURLAnswer3: string;
  audioURLAnswer4: string;
  audioURLAnswer5: string;
  audioURLAnswer6: string;  
  Person = [
    {value:'ich', disabled: true},
    {value:'du', disabled: true},
    {value:'er/sie/es', disabled: true},
    {value:'wir', disabled: true},
    {value:'ihr', disabled: true},
    {value:'sie', disabled: true},
  ];
  currentUser: User;
  Games: PersonalFormsGame[];
  previousGames: PersonalFormsGame[];
  finalScreen = false;
  noMoreGames = false;
  loaded = false;
  saved = false;
  noChanges = false;
  notAllInputFieldsFilled = false;
  editingAudio: boolean = false;
  answers: string[];
  deleteElementOverlay=false;
  dreckigeURL = "https://firebasestorage.googleapis.com/v0/b/kids-8b916.appspot.com/o/audio%2F112a3678-056e-480c-b877-6f7d2c5899e1_1610311152374_753708?alt=media&token=c847474e-d4cf-4ea2-8fd0-c583a029b7fe"
  recordingTimeout: number;
  showMaxRecordingWarning: boolean;



  constructor(private afs: FirestoreDataService, private appService: AppService, public _recordRTC:RecordRTCService) { 
    this.folderUID = sessionStorage.getItem("game-uid");
    sessionStorage.removeItem("game-uid");
  }

  async ngOnInit(): Promise<void> {
    //get user
    await this.afs.getCurrentUser().then(data => this.currentUser = data[0]);
    // get games
    await this.afs.getTasksPerID(this.folderUID).then(data => this.Games = data);
    //init second stack for going back and forwards between games
    let previousGames = [];
    this.previousGames = previousGames;

    //load first game
    this.loadNextGame();
    this.initSounds();
  }



  saveChanges() {
    if (this.checkForChanges()) {
      if(
        (<HTMLInputElement>document.getElementById('question')).value == '' ||
        (<HTMLInputElement>document.getElementById('valueIch')).value == '' ||
        (<HTMLInputElement>document.getElementById('valueDu')).value == '' ||
        (<HTMLInputElement>document.getElementById('valueErSieEs')).value == '' ||
        (<HTMLInputElement>document.getElementById('valueWir')).value == '' ||
        (<HTMLInputElement>document.getElementById('valueIhr')).value == '' ||
        (<HTMLInputElement>document.getElementById('valueSie')).value == '' 
      ) {
        //error
        this.notAllInputFieldsFilled = true;
        setTimeout(() => this.notAllInputFieldsFilled = false, 2500);
        return
      }
      
      let uid;
      if(this.currentGame.uid == '') uid = uuidv4();
      else uid = this.currentGame.uid;
      this.currentGame = new PersonalFormsGame(uid, 
        [(<HTMLInputElement>document.getElementById('question')).value, this.audioURLQuestion],
        [(<HTMLInputElement>document.getElementById('valueIch')).value, this.audioURLAnswer1],
        [(<HTMLInputElement>document.getElementById('valueDu')).value, this.audioURLAnswer2],
        [(<HTMLInputElement>document.getElementById('valueErSieEs')).value, this.audioURLAnswer3],
        [(<HTMLInputElement>document.getElementById('valueWir')).value, this.audioURLAnswer4],
        [(<HTMLInputElement>document.getElementById('valueIhr')).value, this.audioURLAnswer5],
        [(<HTMLInputElement>document.getElementById('valueSie')).value, this.audioURLAnswer6],
        this.folderUID)

        //check if all Fields are filled 
        //TODO


        this.afs.updateTask(this.currentGame);
        this.finalScreen = false;
        this.saved = true;
        setTimeout(() => this.saved = false, 2500);
      }
      else {
        this.noChanges = true;
        setTimeout(() => this.noChanges = false, 2500);
      }
  }

  initSounds() {
    this.audioURLQuestion = this.currentGame.question[1]
    this.audioURLAnswer1 = this.currentGame.ich[1]
    this.audioURLAnswer2 = this.currentGame.du[1]
    this.audioURLAnswer3 = this.currentGame.erSieEs[1]
    this.audioURLAnswer4 = this.currentGame.wir[1]
    this.audioURLAnswer5 = this.currentGame.ihr[1]
    this.audioURLAnswer6 = this.currentGame.sie[1]
  }

  startVoiceRecord(HTMLFinder){
    // this.triggeredHTML = HTMLFinder;
    this._recordRTC.toggleRecord(this.currentGame.uid);
    clearTimeout(this.recordingTimeout)
    this.recordingTimeout = window.setTimeout(() => {
        this.startVoiceRecord(HTMLFinder);
        this.showMaxRecordingWarning = true;
        setTimeout(() => this.showMaxRecordingWarning = false, 4000)
    }, 10800);
    // this.toggleLockedHTML();
  }

  checkForChanges(): boolean{
    if(this.currentGame == undefined) return false;

    this.valueButton1 = (<HTMLInputElement>document.getElementById('valueIch')).value;
    this.valueButton2 = (<HTMLInputElement>document.getElementById('valueDu')).value;
    this.valueButton3 = (<HTMLInputElement>document.getElementById('valueErSieEs')).value;
    this.valueButton4 = (<HTMLInputElement>document.getElementById('valueWir')).value;
    this.valueButton5 = (<HTMLInputElement>document.getElementById('valueIhr')).value;
    this.valueButton6 = (<HTMLInputElement>document.getElementById('valueSie')).value;
    this.question = (<HTMLInputElement>document.getElementById('question')).value;
    if(this.currentGame.ich[0] == this.valueButton1 && 
      this.currentGame.du[0] == this.valueButton2 &&
      this.currentGame.erSieEs[0] == this.valueButton3 &&
      this.currentGame.wir[0] == this.valueButton4 &&
      this.currentGame.ihr[0] == this.valueButton5 &&
      this.currentGame.sie[0] == this.valueButton6 &&
      this.currentGame.question[0] == this.question &&
      this.currentGame.ich[1] == this.audioURLAnswer1 && 
      this.currentGame.du[1] == this.audioURLAnswer2 &&
      this.currentGame.erSieEs[1] == this.audioURLAnswer3 &&
      this.currentGame.wir[1] == this.audioURLAnswer4 &&
      this.currentGame.ihr[1] == this.audioURLAnswer5 &&
      this.currentGame.sie[1] == this.audioURLAnswer6 &&
      this.currentGame.question[1] == this.audioURLQuestion
      ) {

       return false;
    }
  else {
    return true;
  }
}

  //navigating to the next question
  rightArrowClicked() {
    if(this.checkForChanges()) {
      this.unsavedChanges = true;
      console.log("changes!!!!")
    }
    else this.loadNextGame();
  }

  //navigating to previous question
  leftArrowClicked() {
    if(this.checkForChanges()) {
      this.unsavedChanges = true;
      console.log("changes!!!!")
    }
    else this.loadPreviousGame();
  }

  loadNextGame() {
    if(this.finalScreen && this.Games.length == 0) {
      this.noMoreGames = true;
      setTimeout(() => this.noMoreGames = false, 2500);
      return; //maybe add some feedback here
    }

    if(this.currentGame != undefined) this.previousGames.push(this.currentGame)

    // if game has some pages to be played left
    if (this.Games.length > 0) {
        this.currentGame = this.Games.pop();            
    }
    // if game is empty, or you clicked past the last page in the game
    else {
        this.finalScreen = true;
        let uid = uuidv4();
        var newGame = new PersonalFormsGame(uid, ['',''], ['',''], ['',''], ['', ''], ['', ''], ['',''], ['',''], this.folderUID);
        this.currentGame = newGame;        
     }

    //  to prevent disappearing of content - text is filled to have some clickable element
    //  if (this.currentGame.question[0] == "") this.currentGame.question[0] = "Hier die Frage eingeben";
    //  if (this.currentGame.rightAnswer[0] == "") this.currentGame.rightAnswer[0] = "Richtige Antwort";
    //  if (this.currentGame.answer1[0] == "") this.currentGame.answer1[0] = "Falsche Antwort 1";
    //  if (this.currentGame.answer2[0] == "") this.currentGame.answer2[0] = "Falsche Antwort 2";
    //  if (this.currentGame.answer3[0] == "") this.currentGame.answer3[0] = "Falsche Antwort 3";

    // set values for question, answers and photo-url
    //  this.question = this.currentGame.question[0];
    //  this.answers = [this.currentGame.rightAnswer[0], this.currentGame.answer1[0], this.currentGame.answer2[0], this.currentGame.answer3[0]];
    //  this.imageURL = this.currentGame.photoID;
    this.loadInputFieldValues();

    //  lets the html know, that content can now be loaded
    this.initSounds();
    this.loaded = true;
  }

  loadInputFieldValues() {
    (<HTMLInputElement>document.getElementById('question')).value = this.currentGame.question[0];
    (<HTMLInputElement>document.getElementById('valueIch')).value = this.currentGame.ich[0];
    (<HTMLInputElement>document.getElementById('valueDu')).value = this.currentGame.du[0];
    (<HTMLInputElement>document.getElementById('valueErSieEs')).value = this.currentGame.erSieEs[0];
    (<HTMLInputElement>document.getElementById('valueWir')).value = this.currentGame.wir[0];
    (<HTMLInputElement>document.getElementById('valueIhr')).value = this.currentGame.ihr[0];
    (<HTMLInputElement>document.getElementById('valueSie')).value = this.currentGame.sie[0];
  }

  loadPreviousGame() {
    if(this.previousGames.length == 0) {
      this.noMoreGames = true;
      setTimeout(() => this.noMoreGames = false, 2500);
      return; //maybe add some feedback here
    }
    if(this.currentGame != undefined) this.Games.push(this.currentGame)


    this.currentGame = this.previousGames.pop();   
    this.loadInputFieldValues();
    this.loaded = true;  

  }

  saveAndContinue() {
    this.unsavedChanges=false;
    this.saveChanges();  
  }

  discardChanges() {
    this.unsavedChanges=false;
    this.loadInputFieldValues();
    this.initSounds();
  }

  switchMode() {
    if(this.editingAudio == false) {
      this.answers = [document.getElementById('valueIch').innerText, document.getElementById('valueDu').innerText, document.getElementById('valueErSieEs').innerText, document.getElementById('valueWir').innerText, document.getElementById('valueIhr').innerText, document.getElementById('valueSie').innerText];
      this.question = document.getElementById('question').innerText;
      // this.valueButton1 = document.getElementById('button1').innerText;
      // this.valueButton2 = document.getElementById('button2').innerText;
      // this.valueButton3 = document.getElementById('button3').innerText;
      // this.valueButton4 = document.getElementById('button4').innerText;
    }
    this.editingAudio = !this.editingAudio    
  }
  // rework TODO
  stopAudio(htmlSource) {
    (<HTMLAudioElement>document.getElementById('player' + htmlSource)).pause()
    // if(htmlSource == 'question') {
    //   this.audioQuestionPlaying = false;
    // }
    // else if(htmlSource == 'answer1') {
    //   this.audioAnswer1Playing = false;
    // }
    // else if(htmlSource == 'answer2') {
    //   this.audioAnswer2Playing = false;
    // }
    // else if(htmlSource == 'answer3') {
    //   this.audioAnswer3Playing = false;
    // }
    // else if(htmlSource == 'answer4') {
    //   this.audioAnswer4Playing = false;
    // }
    // clearTimeout(this.recordingTimeout)
  }

  // rework TODO
  playAudio(htmlSource) {
    (<HTMLAudioElement>document.getElementById('player')).play();
    setTimeout(() => {
      this.stopAudio(htmlSource);
    }, (<HTMLAudioElement>document.getElementById('player')).duration*1000);
    
    // if(htmlSource == 'question') {
    //   this.audioQuestionPlaying = true;
    // }
    // else if(htmlSource == 'answer1') {
    //   this.audioAnswer1Playing = true;
    // }
    // else if(htmlSource == 'answer2') {
    //   this.audioAnswer2Playing = true;
    // }
    // else if(htmlSource == 'answer3') {
    //   this.audioAnswer3Playing = true;
    // }
    // else if(htmlSource == 'answer4') {
    //   this.audioAnswer4Playing = true;
    // }

  }
}
