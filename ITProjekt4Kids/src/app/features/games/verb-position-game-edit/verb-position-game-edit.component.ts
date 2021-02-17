import { Component, OnInit } from '@angular/core';
import { VerbPositionGame } from 'src/app/models/VerbPositionGame.model';
import { AppService } from 'src/app/services/app.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import { User } from 'src/app/models/users.model';
import {v4 as uuidv4} from 'uuid';
import { RecordRTCService } from 'src/app/services/record-rtc.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-verb-position-game-edit',
  templateUrl: './verb-position-game-edit.component.html',
  styleUrls: ['./verb-position-game-edit.component.css']
})
export class VerbPositionGameEditComponent implements OnInit {

  folderUID;
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
  constructor(private afs: FirestoreDataService, private appService: AppService, public _recordRTC:RecordRTCService, private route: ActivatedRoute) { 
    this.appService.myImageURL$.subscribe((data) => {
      this.imageURL = data;
    });
    this._recordRTC.downloadURL$.subscribe((data) => {
      this.audioURL = data;
      if((<HTMLButtonElement> document.getElementById("audioButtonQuestion")) != null) {
        this.allowRecord(true);
      }
      this.loadAudio();
    })
  }

    async ngOnInit(): Promise<void> {
    //get user
    await this.afs.getCurrentUser().then(data => this.currentUser = data[0]);

    this.folderUID = this.route.snapshot.paramMap.get('id');

    // get games
    await this.afs.getTasksPerID(this.folderUID).then(data => this.Games = data);
    //init second stack for going back and forwards between games
    let previousGames = [];
    this.previousGames = previousGames;
    //load first game
    this.loadNextGame();
    // this.initSounds();
  }



  loadNextGame(nopush?: boolean){
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
        this.valuesOfInput = ['', '', ''];
      	this.audioData = ['', '', ''];
        var newGame = new VerbPositionGame(uid, this.valuesOfInput, this.audioData, ['',''], './../../../../assets/Images/Placeholder-Image/north_blur_Text.png', this.folderUID);
        this.currentGame = newGame;        
     }
     
     this.loadInputFieldValues();

    //  lets the html know, that content can now be loaded
     this.initSounds();
     this.loaded = true;
  }

  loadInputFieldValues() {
    (<HTMLInputElement>document.getElementById('question')).value = this.currentGame.question[0];

    // for(let i = 0; i < this.valuesOfInput.length; i++){
    //   (<HTMLInputElement>document.getElementById('valueWord' + (i+1))).value= this.currentGame.words[i];
    // }

    // this.words = [this.currentGame.words[0], this.currentGame.words[1], this.currentGame.words[2], this.currentGame.words[3], this.currentGame.words[4], this.currentGame.words[5]]

    this.imageURL = this.currentGame.photoID;
    this.valuesOfInput = this.currentGame.words;
    this.audioData = this.currentGame.audio;
    // this.updateValuesOfInputVariable();
  }

  saveChanges() {
    if (this.checkForChanges()) {
      //check if image has changed
      // if(this.currentGame.photoID != this.imageURL) {
        // if(this.currentGame.photoID.search("firebasestorage.googleapis.com") != -1) {
        //   this.afs.deleteFromStorageByUrl(this.currentGame.photoID).catch((err) => {
        //     console.log(err.errorMessage);
        //     //Give Warning that Delete Operation was not successful
        //   });
        // }
        this.currentGame.photoID = this.imageURL;
      // }

      //Vergame must have a question
      if((<HTMLInputElement>document.getElementById('question')).value == ''){
        this.noQuestionFilled = true;
        setTimeout(() => this.noQuestionFilled = false, 2500);
        return
      }
      
      
      let uid;
      if(this.currentGame.uid == '') uid = uuidv4();
      else uid = this.currentGame.uid;


      //Create Game

      console.log(this.valuesOfInput)


      this.currentGame = new VerbPositionGame(
        uid, 
        this.valuesOfInput,
        this.audioData,
        [(<HTMLInputElement>document.getElementById('question')).value],
        this.imageURL,
        this.folderUID)    

        console.log('saved')
        console.log(uid)
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

  checkForChanges(): boolean{
    if(this.currentGame == undefined) return false;

    this.question = (<HTMLInputElement>document.getElementById('question')).value;
    this.updateValuesOfInputVariable();
    // this.audioURLWord1 = (<HTMLInputElement>document.getElementById('audioURLWord1')).value;
    // this.audioURLWord2 = (<HTMLInputElement>document.getElementById('audioURLWord2')).value;
    // this.audioURLWord3 = (<HTMLInputElement>document.getElementById('audioURLWord3')).value;

    var wordsDidChange = false
    for(var i = 0; i < this.valuesOfInput.length; i++){
      if(this.currentGame.words[i] != this.valuesOfInput[i]) {
        wordsDidChange = true;
        
      }
      console.log(this.currentGame.words[i] +" == "+ this.valuesOfInput[i])
    }

    console.log("Words changed? : " + wordsDidChange)
    if(this.currentGame.question[0] == this.question &&
      wordsDidChange == false &&
      // this.currentGame.audio[0] == this.audioURLWord1 &&
      // this.currentGame.audio[1] == this.audioURLWord2 &&
      // this.currentGame.audio[2] == this.audioURLWord3 &&
      // this.currentGame.audio[3] == this.audioURLWord4 &&
      // this.currentGame.audio[4] == this.audioURLWord5 &&
      // this.currentGame.audio[5] == this.audioURLWord6 &&

      this.currentGame.photoID == this.imageURL){
        return false;
    }else {
      //true - es gibt changes, weil inhalte nicht übereinstimmen -> diese speichern
      return true;
    }
  }

  updateValuesOfInputVariable(){

    var temp = []
    for(var i = 0; i<this.valuesOfInput.length; i++) {
        temp.push((<HTMLInputElement>document.getElementById("valueWord" + i)).value)
    }
    if(temp.length<3) temp.push("")
    if(temp.length<3) temp.push("")
    if(temp.length<3) temp.push("")
    this.valuesOfInput = temp;
    console.log(this.valuesOfInput)
  }

  pictureEdited() {  
    //toggle to refresh correct image after inputting a new URL
    this.imageURL = (<HTMLInputElement>document.getElementById('URL')).value;
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
      if(this.currentGame != undefined) this.Games.push(this.currentGame)
      this.currentGame = this.previousGames.pop();   
      this.initSounds();
      this.loadInputFieldValues();
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
    this.loadInputFieldValues();
    this.initSounds();
  }


  switchMode() {
    if(this.editingAudio == false) {
      this.question = (<HTMLInputElement>document.getElementById('question')).value
      this.valueWord1 = (<HTMLInputElement>document.getElementById('valueWord1')).value
      this.valueWord2 = (<HTMLInputElement>document.getElementById('valueWord2')).value
      this.valueWord3 = (<HTMLInputElement>document.getElementById('valueWord3')).value
      this.valueWord4 = (<HTMLInputElement>document.getElementById('valueWord4')).value
      this.valueWord5 = (<HTMLInputElement>document.getElementById('valueWord5')).value
      this.valueWord6 = (<HTMLInputElement>document.getElementById('valueWord6')).value
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
      //unlock all audioButtonAnswer0 audioButtonQuestion
      (<HTMLButtonElement> document.getElementById("audioButtonQuestion")).disabled = false;
      (<HTMLButtonElement> document.getElementById("audioButtonWord1")).disabled = false;
      (<HTMLButtonElement> document.getElementById("audioButtonWord2")).disabled = false;
      (<HTMLButtonElement> document.getElementById("audioButtonWord3")).disabled = false;
      (<HTMLButtonElement> document.getElementById("audioButtonWord4")).disabled = false;
      (<HTMLButtonElement> document.getElementById("audioButtonWord5")).disabled = false;
      (<HTMLButtonElement> document.getElementById("audioButtonWord6")).disabled = false;
      clearTimeout(this.recordingTimeout)
      this.allowRecord(false);
    }
    else{
      this.isRecording = true;
      //lock all except correct one
      if(this.triggeredHTML != 'question')(<HTMLButtonElement> document.getElementById("audioButtonQuestion")).disabled = true;
      if(this.triggeredHTML != 'word1')(<HTMLButtonElement> document.getElementById("audioButtonWord1")).disabled = true;
      if(this.triggeredHTML != 'word2')(<HTMLButtonElement> document.getElementById("audioButtonWord2")).disabled = true;
      if(this.triggeredHTML != 'word3')(<HTMLButtonElement> document.getElementById("audioButtonWord3")).disabled = true;
      if(this.triggeredHTML != 'word4')(<HTMLButtonElement> document.getElementById("audioButtonWord4")).disabled = true;
      if(this.triggeredHTML != 'word5')(<HTMLButtonElement> document.getElementById("audioButtonWord5")).disabled = true;
      if(this.triggeredHTML != 'word6')(<HTMLButtonElement> document.getElementById("audioButtonWord6")).disabled = true;
    }
  }

  allowRecord (allowed) {
    console.log("allowRecord")
    if(allowed == true) {
      console.log("allowRecord = true");
      (<HTMLButtonElement> document.getElementById("audioButtonQuestion")).disabled = false;
      (<HTMLButtonElement> document.getElementById("audioButtonWord1")).disabled = false;
      (<HTMLButtonElement> document.getElementById("audioButtonWord2")).disabled = false;
      (<HTMLButtonElement> document.getElementById("audioButtonWord3")).disabled = false;
      (<HTMLButtonElement> document.getElementById("audioButtonWord4")).disabled = false;
      (<HTMLButtonElement> document.getElementById("audioButtonWord5")).disabled = false;
      (<HTMLButtonElement> document.getElementById("audioButtonWord6")).disabled = false;
    }
    else {
      (<HTMLButtonElement> document.getElementById("audioButtonQuestion")).disabled = true;
      (<HTMLButtonElement> document.getElementById("audioButtonWord1")).disabled = true;
      (<HTMLButtonElement> document.getElementById("audioButtonWord2")).disabled = true;
      (<HTMLButtonElement> document.getElementById("audioButtonWord3")).disabled = true;
      (<HTMLButtonElement> document.getElementById("audioButtonWord4")).disabled = true;
      (<HTMLButtonElement> document.getElementById("audioButtonWord5")).disabled = true;
      (<HTMLButtonElement> document.getElementById("audioButtonWord6")).disabled = true;
    }
  }

  initSounds() {
    this.audioURLQuestion = this.currentGame.question[1]
    this.audioURLWord1 = this.currentGame.audio[0]
    this.audioURLWord2 = this.currentGame.audio[1]
    this.audioURLWord3 = this.currentGame.audio[2]
    this.audioURLWord4 = this.currentGame.audio[3]
    this.audioURLWord5 = this.currentGame.audio[4]
    this.audioURLWord6 = this.currentGame.audio[5]
  }

  loadAudio(){
    if(this.triggeredHTML == 'question') {
      this.audioURLQuestion = this.audioURL;
    }
    else if(this.triggeredHTML == 'word1') {
      this.audioURLWord1 = this.audioURL;
    }
    else if(this.triggeredHTML == 'word2') {
      this.audioURLWord2 = this.audioURL;
    }
    else if(this.triggeredHTML == 'word3') {
      this.audioURLWord3 = this.audioURL;
    }
    else if(this.triggeredHTML == 'word4') {
      this.audioURLWord4 = this.audioURL;
    }
    else if(this.triggeredHTML == 'word5') {
      this.audioURLWord5 = this.audioURL;
    }
    else if(this.triggeredHTML == 'word6') {
      this.audioURLWord6 = this.audioURL;
    }
  }

  playAudio(htmlSource) {

    (<HTMLAudioElement>document.getElementById('player' + htmlSource)).play();
    setTimeout(() => {
      this.stopAudio(htmlSource);
    }, (<HTMLAudioElement>document.getElementById('player' + htmlSource)).duration*1000);
    
    if(htmlSource == 'question') {
      this.audioQuestionPlaying = true;
    }
    else if(htmlSource == 'word1') {
      this.audioWord1Playing = true;
    }
    else if(htmlSource == 'word2') {
      this.audioWord2Playing = true;
    }
    else if(htmlSource == 'word3') {
      this.audioWord3Playing = true;
    }
    else if(htmlSource == 'word4') {
      this.audioWord4Playing = true;
    }
    else if(htmlSource == 'word5') {
      this.audioWord5Playing = true;
    }
    else if(htmlSource == 'word6') {
      this.audioWord6Playing = true;
    }
  }

  stopAudio(htmlSource) {
    (<HTMLAudioElement>document.getElementById('player' + htmlSource)).pause()
    if(htmlSource == 'question') {
      this.audioQuestionPlaying = false;
    }
    else if(htmlSource == 'word1') {
      this.audioWord1Playing = false;
    }
    else if(htmlSource == 'word2') {
      this.audioWord2Playing = false;
    }
    else if(htmlSource == 'word3') {
      this.audioWord3Playing = false;
    }
    else if(htmlSource == 'word4') {
      this.audioWord4Playing = false;
    }
    else if(htmlSource == 'word5') {
      this.audioWord5Playing = false;
    }
    else if(htmlSource == 'word6') {
      this.audioWord6Playing = false;
    }
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

}
