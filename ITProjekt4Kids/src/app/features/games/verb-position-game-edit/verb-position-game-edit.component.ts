import { Component, OnInit } from '@angular/core';
import { VerbPositionGame } from 'src/app/models/VerbPositionGame.model';
import { AppService } from 'src/app/services/app.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import { User } from 'src/app/models/users.model';
import {v4 as uuidv4} from 'uuid';
import { RecordRTCService } from 'src/app/services/record-rtc.service';
import { ActivatedRoute } from '@angular/router';
import { Folder } from 'src/app/models/folder.model';

@Component({
  selector: 'app-verb-position-game-edit',
  templateUrl: './verb-position-game-edit.component.html',
  styleUrls: ['./verb-position-game-edit.component.css']
})
export class VerbPositionGameEditComponent implements OnInit {

  folderUID;
  folder: Folder;
  currentGame: VerbPositionGame;
  currentUser: User;
  Games: VerbPositionGame[];
  previousGames: VerbPositionGame[];
  finalScreen = false;
  noMoreGames = false;
  loaded = false;
  question: string;
  valueWord1: string;
  valueWord2: string;
  valueWord3: string;
  valueWord4: string;
  valueWord5: string;
  valueWord6: string;
  imageURL = "";
  audioURL: string;
  audioURLQuestion: string;
  audioURLWord1: string;
  audioURLWord2: string;
  audioURLWord3: string;
  audioURLWord4: string;
  audioURLWord5: string;
  audioURLWord6: string;
  notAllInputFieldsFilled = false;
  noQuestionFilled = false;
  saved = false;
  noChanges = false;
  editingAudio = false;
  editingPicture = false;
  unsavedChanges = false;
  deleteElementOverlay = false;
  capitalizeFirstLetter = false;
  unauthorized: boolean = false;
  triggeredHTML: string;
  recordingTimeout;
  showMaxRecordingWarning = false;
  isRecording = false;
  audioQuestionPlaying = false;
  audioWord1Playing = false;
  audioWord2Playing = false;
  audioWord3Playing = false;
  audioWord4Playing = false;
  audioWord5Playing = false;
  audioWord6Playing = false;
  words: string[]
  valuesOfInput = [];
  audioData = [];
  isOwner: boolean;
  isEditor: boolean;
  isViewer: boolean = true;
  audioStrings: string[] = [];
  audioURLS: string[] = [];
  audioPlaying = -1;
  easyMode: boolean = true;
  default: boolean;
  punctuationType: string = ".";
  inputForWidthCalc: string;
  c;
  ctx;
  e=null;


  constructor(private afs: FirestoreDataService, private appService: AppService, public _recordRTC:RecordRTCService, private route: ActivatedRoute) { 
    this.appService.myImageURL$.subscribe((data) => {
      this.imageURL = data;
      // console.log(data)
      this.pictureEdited(data)
    });
    this._recordRTC.downloadURL$.subscribe((data) => {
      this.audioURL = data;
      if((<HTMLButtonElement> document.getElementById("audioButton0")) != null) {
        this.allowRecord(true);
      }
      this.loadAudio();
    })
  }

  async ngOnInit(): Promise<void> {
    // scaling of inputboxes
    this.c=document.createElement("canvas");
    this.c.width=1000;
    this.c.height=50;
    this.ctx = this.c.getContext('2d');
    this.ctx.fillStyle='#00F';
    this.ctx.font='16px Times, Serif';

    //get user
    await this.afs.getCurrentUser().then(data => this.currentUser = data[0]);

    if(this.currentUser.role == 3) {
      this.unauthorized = true;
    } else {

        this.folderUID = this.route.snapshot.paramMap.get('id');
        let dockey: string = this.route.snapshot.queryParamMap.get('k');

        //get the data of the game
        await this.afs.getFolderElement(dockey).then(data => {
          let f: Folder[]  = data.folders;
          f.forEach(folder => {
            if (folder.uid == this.folderUID) this.folder = folder
          });
        });

        //set the header
        this.appService.myHeader(this.folder.name);

        //get the rights (Thomas, mit de 2 bools kannst arbeiten - isViewer is eh imma true - jeder kann viewen)
        if (this.folder.owner == this.currentUser.uid) this.isOwner = true;
        if (this.folder.editors.includes(this.currentUser.uid)) this.isEditor = true;

        

          // get games
          await this.afs.getTasksPerID(this.folderUID).then(data => this.Games = data);
          //init second stack for going back and forwards between games
          let previousGames = [];
          this.previousGames = previousGames;
          //load first game
          this.loadNextGame();
          // this.initSounds();
    }
  }



  loadNextGame(nopush?: boolean){
    if(this.finalScreen && this.Games.length == 0) {
      this.noMoreGames = true;
      setTimeout(() => this.noMoreGames = false, 2500);
      if(this.valuesOfInput = []) this.valuesOfInput = ['', '', '']
      return; //maybe add some feedback here
    }

    if(this.currentGame != undefined) this.previousGames.push(this.currentGame)

    // if game has some pages to be played left
    if (this.Games.length > 0) {
        this.currentGame = this.Games.pop();    
        this.valuesOfInput = [];
        this.audioURLS = [];        
        this.loadValuesOfGame();
    }
    // if game is empty, or you clicked past the last page in the game
    else {
        this.finalScreen = true;
        this.default = true; 
        let uid = uuidv4();  
        this.question = '';
        this.valuesOfInput = ['', '', ''];
      	this.audioData = ['', '', ''];
        this.audioURLS = ['', '', '']
        var newGame = new VerbPositionGame(uid, this.valuesOfInput, this.audioData, ['',''], './../../../../assets/Images/Placeholder-Image/north_blur_Text.png', this.folderUID, this.easyMode, this.punctuationType);
        this.currentGame = newGame;        
     }
    if( this.noMoreGames == true) this.valuesOfInput = ['', '', '']
    this.easyMode = this.currentGame.easyMode;

    //  lets the html know, that content can now be loaded
    this.loaded = true;
  }


  loadValuesOfGame() {
    // Text
    this.valuesOfInput = [];
    this.audioURLS = [];
    this.question = null
    this.question = this.currentGame.question[0];
    this.imageURL = this.currentGame.photoID;
    for( var i =0; i < this.currentGame.words.length; i++) {
      this.valuesOfInput.push(this.currentGame.words[i])
    }
    // Audio
    for( var i =0; i < this.currentGame.audio.length; i++) {
      this.audioURLS.push(this.currentGame.audio[i])
    }
    
    // Punctuation Type (.,?,!) 
    this.punctuationType = this.currentGame.punctuationType
    
    //  scale input boxes
    this.calcWidth('question')
    for(var i = 0; i<this.valuesOfInput.length; i++) {
      this.calcWidth('valueWord' + i)
    }
  }

  saveChanges() {
    if (this.checkForChanges()) {

      this.currentGame.photoID = this.imageURL;

      //Verbgame must have a question
      if(this.question == ''){
        this.noQuestionFilled = true;
        setTimeout(() => this.noQuestionFilled = false, 2500);
        return
      }
      
      
      let uid;
      if(this.currentGame.uid == '') uid = uuidv4();
      else uid = this.currentGame.uid;


      //Create Game
      this.currentGame = new VerbPositionGame(
        uid, 
        this.valuesOfInput,
        this.audioURLS,
        [this.question, this.audioURLS[0]],
        this.imageURL,
        this.folderUID,
        this.easyMode,
        this.punctuationType)    
        this.afs.updateTask(this.currentGame);       
        this.finalScreen = false;
        this.saved = true;
        setTimeout(() => this.saved = false, 2500);
      }
    else {
      console.log("no changes")
      this.noChanges = true;
      setTimeout(() => this.noChanges = false, 2500);
    }
  }

  checkForChanges(): boolean{
    if(this.currentGame == undefined) return false;

    // this.audioURLWord1 = (<HTMLInputElement>document.getElementById('audioURLWord1')).value;
    // this.audioURLWord2 = (<HTMLInputElement>document.getElementById('audioURLWord2')).value;
    // this.audioURLWord3 = (<HTMLInputElement>document.getElementById('audioURLWord3')).value;


    // update the words in the input fields - only do when in textmode
    if(this.editingAudio == false){
      this.question = (<HTMLInputElement>document.getElementById('question')).value;
      this.updateValuesOfInputVariable()
    }

    // check for changes in the words
    var wordsDidChange = false
    for(var i = 0; i < this.valuesOfInput.length; i++){
      if(this.currentGame.words[i] != this.valuesOfInput[i]) {
        wordsDidChange = true;        
      }
    }
    if(this.currentGame.words.length != this.valuesOfInput.length) wordsDidChange = true;
    // special case - needs to be in place when moving away from new unedited game
    if(this.currentGame.words.length == 3 
      && this.valuesOfInput.length == 0 
      && this.currentGame.words[0] == '' 
      && this.currentGame.words[1] == '' 
      && this.currentGame.words[2] == '') wordsDidChange = false;
    // check for changes in the audio URLS
    var audioURLSDidChange = false
    for(var i = 0; i < this.audioURLS.length; i++){
      if(this.currentGame.audio[i] != this.audioURLS[i]) {
        audioURLSDidChange = true;        
      }
    }

    this.punctuationType = (<HTMLSelectElement>document.getElementById("punctuationSelector")).value

    if(this.currentGame.audio.length != this.audioURLS.length) audioURLSDidChange = true;
    if(this.currentGame.question[0] == this.question &&
      wordsDidChange == false &&
      audioURLSDidChange == false &&
      this.currentGame.photoID == this.imageURL &&
      this.currentGame.easyMode == this.easyMode &&
      this.currentGame.punctuationType == this.punctuationType){
        return false;
    }else {
      //true - es gibt changes, weil inhalte nicht übereinstimmen -> diese speichern
      return true;
    }
  }

  updateValuesOfInputVariable(){
    //get all inputfields starting with id 'valueword'
    var inputFieldNodes = document.querySelectorAll("[id^='valueWord']")
    // clear the temporary save of words
    this.valuesOfInput = []
    // go through all inputfields, if they contain a word, add them to the temporary word save
    for(var i = 0; i<inputFieldNodes.length; i++) {
      if((<HTMLInputElement>inputFieldNodes[i]).value != "") {
        this.valuesOfInput.push((<HTMLInputElement>inputFieldNodes[i]).value)
      }
    }
  }

  pictureEdited(imageURL?: string) {  
    if((<HTMLInputElement>document.getElementById('URL')) == null) return;
    if(imageURL != null) this.imageURL = imageURL
    else this.imageURL = (<HTMLInputElement>document.getElementById('URL')).value;
    console.log(this.imageURL)
    this.editingPicture = false;            
  }

  abortPictureEdit() {
    //Delete the Uploaded Picture in case the Process was aborted
    if ((<HTMLInputElement>document.getElementById('URL')).value.search("firebasestorage.googleapis.com") != -1) {
      this.afs.deleteFromStorageByUrl((<HTMLInputElement>document.getElementById('URL')).value).catch((err) => {
        console.log(err.errorMessage);
        //Give Warning that Delete Operation was not successful
      });
    }
    this.editingPicture = false;
    this.imageURL = this.currentGame.photoID;
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

  loadPreviousGame() {
    if(this.previousGames.length == 0) {
      this.noMoreGames = true;
      this.loaded = true;
      setTimeout(() => this.noMoreGames = false, 2500);
      return; //maybe add some feedback here
    }else{
      this.finalScreen = false;
      if(this.currentGame != undefined  && this.default == false) this.Games.push(this.currentGame)
      else this.default = false;

      this.currentGame = this.previousGames.pop();   
      // this.initSounds();
      this.valuesOfInput = [];
      this.audioURLS = [];
      this.easyMode = this.currentGame.easyMode;
      this.loadValuesOfGame();
      this.loaded = true;  
    } 
  }

  /**
   * Deletes the currentGame from the Database
   */
 async deleteQuestion() {
    if (!this.finalScreen) {
      //get the UID from the CurrentElement if it is a valid Question
      let questionToDelete = this.currentGame.uid;
      //delete the question from the database
      this.loaded = false;
      this.deleteElementOverlay = false;
      await this.afs.deleteDocument("games", questionToDelete);
      this.loadNextGame(true);
    }
  }

  //save button from warning of unsaved changes
  saveAndContinue() {
    this.unsavedChanges=false;
    this.saveChanges();    
  }

  //discard button from warning of unsaved changes
  discardChanges() {
    this.unsavedChanges=false;
    if (this.imageURL != this.currentGame.photoID) {
      if (this.imageURL.search("firebasestorage.googleapis.com") != -1) {
        this.afs.deleteFromStorageByUrl(this.imageURL);
      }
    }
    this.loadValuesOfGame();
    this.easyMode = this.currentGame.easyMode;
    
    // this.initSounds();
  }


  switchMode() {
    if(this.editingAudio == false) {
      this.updateValuesOfInputVariable();
      this.audioStrings = [];
      // this.answers = [(<HTMLInputElement>document.getElementById('valueIch')).value, (<HTMLInputElement>document.getElementById('valueDu')).value, (<HTMLInputElement>document.getElementById('valueErSieEs')).value, (<HTMLInputElement>document.getElementById('valueWir')).value, (<HTMLInputElement>document.getElementById('valueIhr')).value, (<HTMLInputElement>document.getElementById('valueSie')).value];
      this.question = (<HTMLInputElement>document.getElementById('question')).value;
      
      // Strings e.g. Was macht der Affe?, Der Affe, spielt, die Gitarre, ...
      this.audioStrings.push(this.question);
      this.audioStrings = this.audioStrings.concat(this.valuesOfInput);
    }
    this.editingAudio = !this.editingAudio    
  }

  startVoiceRecord(HTMLFinder){
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
    if(this.isRecording) {
      this.isRecording = false;
      //lock all record buttons and w8 for response from Server with URL (constructor listens for change)
      // for(var i = 0; i<this.audioStrings.length ; i++){
      //   (<HTMLButtonElement> document.getElementById("audioButton" + i)).disabled = true;
      // }
      clearTimeout(this.recordingTimeout)
      this.allowRecord(false);
    }
    else{      
      this.isRecording = true;
      //lock all except correct one
      for(var i = 0; i<this.audioStrings.length ; i++){
        (<HTMLButtonElement> document.getElementById("audioButton" + i)).disabled = true;
        console.log("audioButton" + i + " = " + (<HTMLButtonElement> document.getElementById("audioButton" + i)).disabled)

      }
      (<HTMLButtonElement> document.getElementById("audioButton" + this.triggeredHTML)).disabled = false;
      
    }
  }

  allowRecord (allowed) {
    // TODO
    console.log("allowRecord")
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


  // initSounds() {
  //   this.audioURLQuestion = this.currentGame.question[1]
  //   this.audioURLWord1 = this.currentGame.audio[0]
  //   this.audioURLWord2 = this.currentGame.audio[1]
  //   this.audioURLWord3 = this.currentGame.audio[2]
  //   this.audioURLWord4 = this.currentGame.audio[3]
  //   this.audioURLWord5 = this.currentGame.audio[4]
  //   this.audioURLWord6 = this.currentGame.audio[5]
  // }

  loadAudio(){
    this.audioURLS[this.triggeredHTML] = this.audioURL
  }
  
  playAudio(htmlSource) {
    if(this.audioPlaying != -1) this.stopAudio(this.audioPlaying);
    (<HTMLAudioElement>document.getElementById('player' + htmlSource)).play();
    setTimeout(() => {
      this.stopAudio(htmlSource);
    }, (<HTMLAudioElement>document.getElementById('player' + htmlSource)).duration*1000);
    this.audioPlaying = htmlSource;
  }

  stopAudio(htmlSource) {
    (<HTMLAudioElement>document.getElementById('player' + htmlSource)).pause()
    this.audioPlaying = -1;
    clearTimeout(this.recordingTimeout)
  }

  noAudioSource() {
    //insert a warning that no audio can be found
  }

  addInputField(){
    this.valuesOfInput.push("")
  }

  removeInputField() {
    this.valuesOfInput.pop()
  }

  switchDifficulty(){
    this.easyMode = !this.easyMode
    // if(!this.easyMode)document.getElementById("customSwitch1").setAttribute("checked", null);
    // else document.getElementById("customSwitch1").removeAttribute("checked")
  }

  calcWidth(HTMLID){


    
      if(this.e==null) this.e=document.getElementById(HTMLID);
      var myText=this.e.value;
      var textWidth=this.ctx.measureText(myText);
      if(textWidth.width<50) return;
      this.e.style.width=textWidth.width+45+"px";
    
  }




  

}
