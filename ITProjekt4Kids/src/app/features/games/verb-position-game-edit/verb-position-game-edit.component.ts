import { Component, OnInit } from '@angular/core';
import {CdkDragDrop, CdkDropList, CDK_DROP_LIST, copyArrayItem, DragDropModule, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { VerbPositionGame } from 'src/app/models/VerbPositionGame.model';
import { AppService } from 'src/app/services/app.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import { User } from 'src/app/models/users.model';
import {v4 as uuidv4} from 'uuid';

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
  imageURL = "";
  audioURLQuestion: string;
  audioURLWord1: string;
  audioURLWord2: string;
  audioURLWord3: string;

  notAllInputFieldsFilled = false;
  saved = false;
  noChanges = false;
  editingAudio = false;
  editingPicture = false;
  unsavedChanges = false;

  constructor(private afs: FirestoreDataService, private appService: AppService) { 
    this.appService.myGameData$.subscribe((data) => {
      this.folderUID = data;
    });
    this.appService.myImageURL$.subscribe((data) => {
      this.imageURL = data;
    });
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
    //this.initSounds();
  }

  loadNextGame(){
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
        var newGame = new VerbPositionGame(uid, ['', '', ''], ['', '', ''], ['',''], 'https://ipsumimage.appspot.com/900x600,F5F4F4?l=|Klicke+hier,|um+ein+Bild+einzuf%C3%BCgen!||&s=67', this.folderUID);
        this.currentGame = newGame;        
     }
     
     this.loadInputFieldValues();

    //  lets the html know, that content can now be loaded
    // this.initSounds();
     this.loaded = true;
  }

  loadInputFieldValues() {
    (<HTMLInputElement>document.getElementById('question')).value = this.currentGame.question[0];
    (<HTMLInputElement>document.getElementById('valueWord1')).value= this.currentGame.words[0];
    (<HTMLInputElement>document.getElementById('valueWord2')).value= this.currentGame.words[1];
    (<HTMLInputElement>document.getElementById('valueWord3')).value= this.currentGame.words[2];
    this.imageURL = this.currentGame.photoID;
  }

  saveChanges() {
    if (this.checkForChanges()) {
      if(this.currentGame.photoID != this.imageURL) {
        if(this.currentGame.photoID.search("firebasestorage.googleapis.com") != -1) {
          this.afs.deleteFromStorageByUrl(this.currentGame.photoID).catch((err) => {
            console.log(err.errorMessage);
            //Give Warning that Delete Operation was not successful
          });
        }
        this.currentGame.photoID = this.imageURL;
        console.log('image url: ' + this.imageURL)
        console.log('curr img url: ' + this.currentGame.photoID)
      }

      if(
        (<HTMLInputElement>document.getElementById('question')).value == '' ||
        (<HTMLInputElement>document.getElementById('valueWord1')).value == '' ||
        (<HTMLInputElement>document.getElementById('valueWord2')).value == '' ||
        (<HTMLInputElement>document.getElementById('valueWord3')).value == ''
      ) {
        //error
        this.notAllInputFieldsFilled = true;
        setTimeout(() => this.notAllInputFieldsFilled = false, 2500);
        console.log("not all fields filled")
        return
      }
      
      let uid;
      if(this.currentGame.uid == '') uid = uuidv4();
      else uid = this.currentGame.uid;

      this.currentGame = new VerbPositionGame(
        uid, 
        [(<HTMLInputElement>document.getElementById('valueWord1')).value,
        (<HTMLInputElement>document.getElementById('valueWord2')).value,
        (<HTMLInputElement>document.getElementById('valueWord3')).value],

        [(<HTMLInputElement>document.getElementById('audioURLWord1')).value,
        (<HTMLInputElement>document.getElementById('audioURLWord2')).value,
        (<HTMLInputElement>document.getElementById('audioURLWord3')).value],
        // ["audio", "to be", "done"],

        [(<HTMLInputElement>document.getElementById('question')).value],
        this.imageURL,
        this.folderUID)

        console.log('saved')
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

  checkForChanges(): boolean{
    if(this.currentGame == undefined) return false;

    this.question = (<HTMLInputElement>document.getElementById('question')).value;
    this.valueWord1 = (<HTMLInputElement>document.getElementById('valueWord1')).value;
    this.valueWord2 = (<HTMLInputElement>document.getElementById('valueWord2')).value;
    this.valueWord3 = (<HTMLInputElement>document.getElementById('valueWord3')).value;
    this.audioURLWord1 = (<HTMLInputElement>document.getElementById('audioURLWord1')).value;
    this.audioURLWord2 = (<HTMLInputElement>document.getElementById('audioURLWord2')).value;
    this.audioURLWord3 = (<HTMLInputElement>document.getElementById('audioURLWord3')).value;
  
    // console.log("curr: " + this.currentGame.photoID)
    // console.log("image url: " + this.imageURL)

    if(this.currentGame.question[0] == this.question &&
      this.currentGame.words[0] == this.valueWord1 &&
      this.currentGame.words[1] == this.valueWord2 && 
      this.currentGame.words[2] == this.valueWord3 &&
      // this.currentGame.audio[0] == this.audioURLWord1 &&
      // this.currentGame.audio[1] == this.audioURLWord2 &&
      // this.currentGame.audio[2] == this.audioURLWord3 &&
      this.currentGame.photoID == this.imageURL){
        return false;
    }else {
      console.log(this.currentGame.question[0] + "/ " + this.question)
      console.log(this.currentGame.words[0] + "/ " + this.valueWord1)
      console.log(this.currentGame.words[1] + "/ " + this.valueWord2)
      console.log(this.currentGame.words[2] + "/ " + this.valueWord3)
      console.log(this.currentGame.audio[0] + "/ " + this.audioURLWord1)
      console.log(this.currentGame.audio[1] + "/ " + this.audioURLWord2)
      console.log(this.currentGame.audio[2] + "/ " + this.audioURLWord3)
      console.log(this.currentGame.photoID + "/ " + this.imageURL)

      return true;
    }
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
      setTimeout(() => this.noMoreGames = false, 2500);
      return; //maybe add some feedback here
    }
    if(this.currentGame != undefined) this.Games.push(this.currentGame)

    this.currentGame = this.previousGames.pop();   
    this.loadInputFieldValues();
    this.loaded = true;  
  }


}
