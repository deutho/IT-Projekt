import { Component, OnDestroy, OnInit } from '@angular/core';
import {CdkDragDrop, CdkDropList, CDK_DROP_LIST, copyArrayItem, DragDropModule, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { AppService } from 'src/app/services/app.service';
import {v4 as uuidv4} from 'uuid';
import { PersonalFormsGame } from 'src/app/models/PersonalFormsGame.model';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import { take } from 'rxjs/operators';
import { User } from 'src/app/models/users.model';
import { RecordRTCService } from 'src/app/services/record-rtc.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Folder } from 'src/app/models/folder.model';

@Component({
  selector: 'app-personal-forms-game-edit',
  templateUrl: './personal-forms-game-edit.component.html',
  styleUrls: ['./personal-forms-game-edit.component.css']
})
export class PersonalFormsGameEditComponent implements OnInit, OnDestroy {
  
  folderUID;
  folder: Folder;
  currentGame: PersonalFormsGame
  unsavedChanges = false;
  unauthorized: boolean = false;
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
  recordingTimeout: number;
  showMaxRecordingWarning: boolean;
  audioStrings: string[] = [];
  audioURLS: string[] = [];
  triggeredHTML: any;
  isRecording: any = false;
  audioURL: string;
  audioPlaying = -1;
  isOwner: boolean = false;
  isEditor: boolean = false;
  isViewer: boolean = false;
  studentmode: boolean = false;
  dockey: string;
  studentmodesubscription;
  audioURLSubscription: any;


  constructor(private router: Router, private afs: FirestoreDataService, private appService: AppService, public _recordRTC:RecordRTCService, private route: ActivatedRoute) { 

    this.audioURLSubscription = this._recordRTC.downloadURL$.subscribe((data) => {
      this.audioURL = data;
      if((<HTMLButtonElement> document.getElementById("audioButton0")) != null) {
        this.allowRecord(true);
      }
      this.loadAudio();
      // console.log("hellloooo")
    })
  }

  async ngOnInit(): Promise<void> {
    //get user
    await this.afs.getCurrentUser().then(data => this.currentUser = data[0]);

    if(this.currentUser.role == 3) {
      this.unauthorized = true;
    } else {

          this.folderUID = this.route.snapshot.paramMap.get('id');

          this.dockey = this.route.snapshot.queryParamMap.get('k');

          await this.afs.getFolderElement(this.dockey).then(data => {
            let f: Folder[]  = data.folders;
            f.forEach(folder => {
              if (folder.uid == this.folderUID) this.folder = folder
            });
          }).catch(() => this.router.navigate(['notfound'], {replaceUrl: true}))
  
          if (this.folder == undefined) {
            this.router.navigate(['notfound'], {replaceUrl: true});
          } else {

            //set the header
            this.appService.myHeader(this.folder.name);

            //get the rights (Thomas, mit de 2 bools kannst arbeiten - isViewer is eh imma true - jeder kann viewen)
            if (this.folder.owner == this.currentUser.uid) this.isOwner = true;
            if (this.folder.editors.includes(this.currentUser.uid)) this.isEditor = true;
            if (this.isOwner == false && this.isEditor == false) this.isViewer = true;

            // get games
            await this.afs.getTasksPerID(this.folderUID).then(data => this.Games = data);
            //init second stack for going back and forwards between games
            let previousGames = [];
            this.previousGames = previousGames;

            //load first game
            this.loadNextGame();
            this.initSounds();
          }
    }

    this.studentmodesubscription = this.appService.myStudentMode$.subscribe((data) => {
      if (this.currentUser.role == 2 && data != this.studentmode)
      this.router.navigate(['game/'+this.folderUID], {queryParams:{k: this.dockey, t: 'personal-forms-game'}, replaceUrl: true});
    });
  }



  saveChanges() {
    console.log("checking for changes")
    if (this.checkForChanges()) {
      console.log("changes found")
      if(
        this.audioStrings[0] == '' ||
        this.audioStrings[1] == '' ||
        this.audioStrings[2] == '' ||
        this.audioStrings[3] == '' ||
        this.audioStrings[4] == '' ||
        this.audioStrings[5] == '' ||
        this.audioStrings[6] == '' 
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
        [this.audioStrings[0], this.audioURLS[0]],
        [this.audioStrings[1], this.audioURLS[1]],
        [this.audioStrings[2], this.audioURLS[2]],
        [this.audioStrings[3], this.audioURLS[3]],
        [this.audioStrings[4], this.audioURLS[4]],
        [this.audioStrings[5], this.audioURLS[5]],
        [this.audioStrings[6], this.audioURLS[6]],
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
    console.log(HTMLFinder)
    this.triggeredHTML = HTMLFinder;
    this._recordRTC.toggleRecord(this.currentGame.uid);
    clearTimeout(this.recordingTimeout)
    this.recordingTimeout = window.setTimeout(() => {
        this.startVoiceRecord(HTMLFinder);
        this.showMaxRecordingWarning = true;
        setTimeout(() => this.showMaxRecordingWarning = false, 4000)
    }, 10800);
    this.toggleLockedHTML();
  }

  toggleLockedHTML() {
    console.log("toggle locking of html")
    if(this.isRecording) {
      this.isRecording = false;
      //unlock all record buttons
      // for(var i = 0; i<this.audioStrings.length ; i++){
      //   (<HTMLButtonElement> document.getElementById("audioButton" + i)).disabled = false;
      // }
      clearTimeout(this.recordingTimeout)
      this.allowRecord(false);
    }
    else{      
      this.isRecording = true;
      //lock all except correct one
      for(var i = 0; i<this.audioStrings.length ; i++){
        (<HTMLButtonElement> document.getElementById("audioButton" + i)).disabled = true;
      }
      (<HTMLButtonElement> document.getElementById("audioButton" + this.triggeredHTML)).disabled = false;
      
    }
  }

  allowRecord (allowed) {
    // TODO
    // console.log("allowRecord")
    if(allowed == true) {
      // console.log("allowRecord = true");
      for(var i = 0; i<this.audioStrings.length ; i++){
        (<HTMLButtonElement> document.getElementById("audioButton" + i)).disabled = false;
      }
    }
    else {
      for(var i = 0; i<this.audioStrings.length ; i++){
        (<HTMLButtonElement> document.getElementById("audioButton" + i)).disabled = true;
      }
    }
  }

  loadAudio(){
    this.audioURLS[this.triggeredHTML] = this.audioURL
  }

  checkForChanges(): boolean{
    if(this.currentGame == undefined) return false;
    this.loadCurrentValues()
    if(
      this.currentGame.question[0] == this.audioStrings[0] &&
      this.currentGame.ich[0] == this.audioStrings[1] && 
      this.currentGame.du[0] == this.audioStrings[2] &&
      this.currentGame.erSieEs[0] == this.audioStrings[3] &&
      this.currentGame.wir[0] == this.audioStrings[4] &&
      this.currentGame.ihr[0] == this.audioStrings[5] &&
      this.currentGame.sie[0] == this.audioStrings[6] &&
      
      this.currentGame.question[1] == this.audioURLS[0] &&
      this.currentGame.ich[1] == this.audioURLS[1] && 
      this.currentGame.du[1] == this.audioURLS[2] &&
      this.currentGame.erSieEs[1] == this.audioURLS[3] &&
      this.currentGame.wir[1] == this.audioURLS[4] &&
      this.currentGame.ihr[1] == this.audioURLS[5] &&
      this.currentGame.sie[1] == this.audioURLS[6]       
      ) {
       return false;
    }
    
  else {
    return true;
  }
}

loadCurrentValues(){
  if(this.editingAudio == false) {
    this.audioStrings = [];
    this.answers = [(<HTMLInputElement>document.getElementById('valueIch')).value, (<HTMLInputElement>document.getElementById('valueDu')).value, (<HTMLInputElement>document.getElementById('valueErSieEs')).value, (<HTMLInputElement>document.getElementById('valueWir')).value, (<HTMLInputElement>document.getElementById('valueIhr')).value, (<HTMLInputElement>document.getElementById('valueSie')).value];
    this.question = (<HTMLInputElement>document.getElementById('question')).value;
    
    // Strings e.g. Ordne zu!, gehe, gehst, geht, ...
    this.audioStrings.push(this.question);
    this.audioStrings = this.audioStrings.concat(this.answers);
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
    if((this.finalScreen && this.Games.length == 0) || (this.isViewer && this.Games.length == 0))  {
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

    this.audioStrings = [ this.currentGame.question[0],
                          this.currentGame.ich[0],
                          this.currentGame.du[0],
                          this.currentGame.erSieEs[0],
                          this.currentGame.wir[0],
                          this.currentGame.ihr[0],
                          this.currentGame.sie[0]];

  this.audioURLS = [ this.currentGame.question[1],
                        this.currentGame.ich[1],
                        this.currentGame.du[1],
                        this.currentGame.erSieEs[1],
                        this.currentGame.wir[1],
                        this.currentGame.ihr[1],
                        this.currentGame.sie[1]];
    console.log("loaded data from currentgame URLS: " + this.audioURLS)
    // console.log(this.audioURLS[0])
    // (<HTMLInputElement>document.getElementById('question')).value = this.currentGame.question[0];
    // (<HTMLInputElement>document.getElementById('valueIch')).value = this.currentGame.ich[0];
    // (<HTMLInputElement>document.getElementById('valueDu')).value = this.currentGame.du[0];
    // (<HTMLInputElement>document.getElementById('valueErSieEs')).value = this.currentGame.erSieEs[0];
    // (<HTMLInputElement>document.getElementById('valueWir')).value = this.currentGame.wir[0];
    // (<HTMLInputElement>document.getElementById('valueIhr')).value = this.currentGame.ihr[0];
    // (<HTMLInputElement>document.getElementById('valueSie')).value = this.currentGame.sie[0];
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
      this.audioStrings = [];
      this.answers = [(<HTMLInputElement>document.getElementById('valueIch')).value, (<HTMLInputElement>document.getElementById('valueDu')).value, (<HTMLInputElement>document.getElementById('valueErSieEs')).value, (<HTMLInputElement>document.getElementById('valueWir')).value, (<HTMLInputElement>document.getElementById('valueIhr')).value, (<HTMLInputElement>document.getElementById('valueSie')).value];
      this.question = (<HTMLInputElement>document.getElementById('question')).value;
      
      // Strings e.g. Ordne zu!, gehe, gehst, geht, ...
      this.audioStrings.push(this.question);
      this.audioStrings = this.audioStrings.concat(this.answers);
    }
    //Audio View - load list with strings and URLS to dynamicly create the audio controls
    this.editingAudio = !this.editingAudio  
    console.log(this.audioURLS)

  }
  // rework TODO
  stopAudio(htmlSource) {
    (<HTMLAudioElement>document.getElementById('player' + htmlSource)).pause()
    this.audioPlaying = -1;
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
    if(this.audioPlaying != -1) this.stopAudio(this.audioPlaying);
    (<HTMLAudioElement>document.getElementById('player' + htmlSource)).play();
    setTimeout(() => {
      this.stopAudio(htmlSource);
    }, (<HTMLAudioElement>document.getElementById('player' + htmlSource)).duration*1000);
    this.audioPlaying = htmlSource;
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

  noAudioSource() {
    //insert a warning that no audio can be found
  }

  async deleteQuestion() {
  
    if (!this.finalScreen) {
      //get the UID from the CurrentElement if it is a valid Question
      let questionToDelete = this.currentGame.uid;
      //delete the question from the database
      this.loaded = false;
      this.deleteElementOverlay = false;
      await this.afs.deleteDocument("games", questionToDelete);
      this.loadNextGame();
    }

  }

  ngOnDestroy() {
    if (this.studentmodesubscription != undefined) this.studentmodesubscription.unsubscribe(); 
    this.audioURLSubscription.unsubscribe(); 
   }
}
