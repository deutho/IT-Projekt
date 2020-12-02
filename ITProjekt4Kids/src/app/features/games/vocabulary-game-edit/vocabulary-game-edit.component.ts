import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { take } from 'rxjs/internal/operators/take';
import { Router } from '@angular/router';
import { VocabularyGame } from 'src/app/models/VocabularyGame.model';
import { User } from 'src/app/models/users.model';
import { AppService } from 'src/app/services/app.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import {v4 as uuidv4} from 'uuid';
import { RecordRTCService } from 'src/app/services/record-rtc.service';

@Component({
  selector: 'app-vocabulary-game-edit',
  templateUrl: './vocabulary-game-edit.component.html',
  styleUrls: ['./vocabulary-game-edit.component.css']
})
export class VocabularyGameEditComponent implements OnInit {

  // global variables
  Games: VocabularyGame[];
  currentGame: VocabularyGame;
  currentUser: User;
  playedGames: VocabularyGame[];
  loaded = undefined;
  answers: string[];
  imageURL = "";
  editingPicture = false;
  previousGames: VocabularyGame[];
  folderID = "";
  question: string;
  saved;
  noChanges;
  unsavedChanges = false;
  isDefault = false;
  finalScreen = false;
  noMoreGames = false;
  audioURL: string;
  selectedDOMElement: HTMLElement;

  constructor(private afs: FirestoreDataService, private router: Router, private appService: AppService, private dashboardService: DashboardService, public _recordRTC:RecordRTCService,) {
    // get folder where game created in
    this.appService.myGameData$.subscribe((data) => {
      this.folderID = data;
    });
    this.appService.myImageURL$.subscribe((data) => {
      this.imageURL = data;
    });    
    this._recordRTC.downloadURL$.subscribe((data) => {
      this.audioURL = data;
      console.log(this.audioURL)
    })
  }

  async ngOnInit(): Promise<void> {
    //get user
    await this.afs.getCurrentUser().valueChanges().pipe(take(1)).toPromise()
      .then(data => this.currentUser = data[0]);
    // get games
    await this.afs.getTasksPerID(this.folderID).valueChanges().pipe(take(1)).toPromise()
      .then(data => this.Games = data);
    //init second stack for going back and forwards between games
    let previousGames = [];
    this.previousGames = previousGames;

    //load first game
    this.loadNextGame();
  }

  startVoiceRecord(event){
    this._recordRTC.toggleRecord();
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
        var newGame = new VocabularyGame(uid, ['Falsche Antwort 1',''], ['Falsche Antwort 2',''], ['Falsche Antwort 3',''], ['Richtige Antwort', ''], ["Hier die Frage eingeben", ''], 'https://cdn.pixabay.com/photo/2017/01/18/17/39/cloud-computing-1990405_960_720.png', this.folderID);
        this.currentGame = newGame;
        
     }

    //  to prevent disappearing of content - text is filled to have some clickable element
     if (this.currentGame.question[0] == "") this.currentGame.question[0] = "Hier die Frage eingeben";
     if (this.currentGame.rightAnswer[0] == "") this.currentGame.rightAnswer[0] = "Richtige Antwort";
     if (this.currentGame.answer1[0] == "") this.currentGame.answer1[0] = "Falsche Antwort 1";
     if (this.currentGame.answer2[0] == "") this.currentGame.answer2[0] = "Falsche Antwort 2";
     if (this.currentGame.answer3[0] == "") this.currentGame.answer3[0] = "Falsche Antwort 3";

    // set values for question, answers and photo-url
     this.question = this.currentGame.question[0];
     this.answers = [this.currentGame.rightAnswer[0], this.currentGame.answer1[0], this.currentGame.answer2[0], this.currentGame.answer3[0]];
     this.imageURL = this.currentGame.photoID;


    //  lets the html know, that content can now be loaded
    console.log(this.currentGame.question[0])
    console.log(this.currentGame.answer1[0])
    console.log(this.currentGame.answer2[0])
    console.log(this.currentGame.answer3[0])
    console.log(this.currentGame.rightAnswer[0])
    console.log(this.currentGame.photoID)
     this.loaded = true;

  }

    // makes changes persitant in the database
  saveChanges() { 
    //checks if changes have been made - if so, update the game
    if (this.checkForChanges()) {
      this.currentGame.rightAnswer[0] = document.getElementById('button1').innerText;
      this.currentGame.answer1[0] = document.getElementById('button2').innerText;
      this.currentGame.answer2[0] = document.getElementById('button3').innerText;
      this.currentGame.answer3[0] = document.getElementById('button4').innerText;
      this.currentGame.question[0] = document.getElementById('question').innerText;
      if(this.currentGame.photoID != this.imageURL) {
        if(this.currentGame.photoID.search("firebasestorage.googleapis.com") != -1) {
          this.afs.deleteFromStorageByUrl(this.currentGame.photoID).catch((err) => {
            console.log(err.errorMessage);
            //Give Warning that Delete Operation was not successful
          });
        }
        this.currentGame.photoID = this.imageURL;
      }
      


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

  deletePictureOnAbort() {

  }

  uploadTextToSpeechElement(element) {

    //TO DO Switch Case for the specific Element

    this.currentGame.answer1; //Example
    
    if(this.currentGame.answer1[1] == ""){
    //Upload the Element
    
    //Set the Download URL

    }else {
      //Delete Current TextToSpeech Element on Firebase Storage

      //upload the new Element

      //Set the DownloadURL
    }
  }

  // activated on click of left arrow - loades the previous game
  loadPreviousGame() {
    if(this.previousGames.length == 0) {
      this.noMoreGames = true;
      setTimeout(() => this.noMoreGames = false, 2500);
      return; //maybe add some feedback here
    }
    if(this.currentGame != undefined) this.Games.push(this.currentGame)


    this.currentGame = this.previousGames.pop();   
    this.question = this.currentGame.question[0];
    this.answers = [this.currentGame.rightAnswer[0], this.currentGame.answer1[0], this.currentGame.answer2[0], this.currentGame.answer3[0]];
    this.imageURL = this.currentGame.photoID; 
    this.loaded = true;  
    
    this.loadInnerTextValues();
  }
  
  // activates on Home-Button click, return, the user to the home menu, and saves changed if any were made
  returnToMainMenu() {
    var data = "mainMenu";
    this.appService.myComponent(data);
    this.dashboardService.changes();
    var header = "Hauptmenü"
    this.appService.myHeader(header);
  }

  // checks if the question, the image, or one of the button values has changed
  checkForChanges(): boolean{
    if(this.currentGame == undefined) return false;
    let valueButton1 = document.getElementById('button1').innerText;
    let valueButton2 = document.getElementById('button2').innerText;
    let valueButton3 = document.getElementById('button3').innerText;
    let valueButton4 = document.getElementById('button4').innerText;
    let question = document.getElementById('question').innerText;
    if(this.currentGame.rightAnswer[0] == valueButton1 && 
       this.currentGame.answer1[0] == valueButton2 &&
       this.currentGame.answer2[0] == valueButton3 &&
       this.currentGame.answer3[0] == valueButton4 &&
       this.currentGame.question[0] == question &&
       this.currentGame.photoID == this.imageURL) {
        return false;
       }
    else {
      return true;
    }
  }

  pictureEdited() {  
    //toggle to refresh correct image after inputting a new URL
    this.imageURL = (<HTMLInputElement>document.getElementById('URL')).value;

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
    }
    else this.loadNextGame();
  }

  //navigating to previous question
  leftArrowClicked() {
    if(this.checkForChanges()) {
      this.unsavedChanges = true;
    }
    else this.loadPreviousGame();
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
    this.loadInnerTextValues();
  }

  //As content is mutable, this is necessary to avoid bugs
  loadInnerTextValues() {
    document.getElementById('button1').innerText = this.currentGame.rightAnswer[0];
    document.getElementById('button2').innerText = this.currentGame.answer1[0];
    document.getElementById('button3').innerText = this.currentGame.answer2[0];
    document.getElementById('button4').innerText = this.currentGame.answer3[0];
    document.getElementById('question').innerText = this.currentGame.question[0];
    this.imageURL = this.currentGame.photoID;
  }

}
