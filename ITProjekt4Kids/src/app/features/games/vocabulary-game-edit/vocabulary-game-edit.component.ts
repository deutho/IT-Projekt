import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { take } from 'rxjs/internal/operators/take';
import { Router } from '@angular/router';
import { VocabularyGame } from 'src/app/models/VocabularyGame.model';
import { User } from 'src/app/models/users.model';
import { AppService } from 'src/app/services/app.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import {v4 as uuidv4} from 'uuid';
import { CombineLatestOperator } from 'rxjs/internal/observable/combineLatest';


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

  constructor(private afs: FirestoreDataService, private router: Router, private appService: AppService, private dashboardService: DashboardService) {
    // get folder where game created in
    this.appService.myGameData$.subscribe((data) => {
      this.folderID = data;
    });
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

  loadNextGame() {   

    if(this.currentGame != undefined) this.previousGames.push(this.currentGame)

    // if game has some pages to be played left
    if (this.Games.length > 0) {
        this.currentGame = this.Games.pop();     
       
    }
    // if game is empty, or you clicked past the last page in the game
    else {
        let uid = uuidv4();
        var newGame = new VocabularyGame(uid, 'Falsche Antwort 1', 'Falsche Antwort 2', 'Falsche Antwort 3', 'Richtige Antwort', "Hier die Frage eingeben", 'https://cdn.pixabay.com/photo/2017/01/18/17/39/cloud-computing-1990405_960_720.png', this.folderID);
        this.currentGame = newGame;
     }

    //  to prevent disappearing of content - text is filled to have some clickable element
     if (this.currentGame.question == "") this.currentGame.question = "Hier die Frage eingeben";
     if (this.currentGame.rightAnswer == "") this.currentGame.rightAnswer = "Richtige Antwort";
     if (this.currentGame.answer1 == "") this.currentGame.answer1 = "Falsche Antwort 1";
     if (this.currentGame.answer2 == "") this.currentGame.answer2 = "Falsche Antwort 2";
     if (this.currentGame.answer3 == "") this.currentGame.answer3 = "Falsche Antwort 3";

    // set values for question, answers and photo-url
     this.question = this.currentGame.question;
     this.answers = [this.currentGame.rightAnswer, this.currentGame.answer1, this.currentGame.answer2, this.currentGame.answer3];
     this.imageURL = this.currentGame.photoID;
     
    //  debugging
     console.log(this.currentGame);

    //  lets the html know, that content can now be loaded
     this.loaded = true;
    
    }

    // makes changes persitant in the database
  saveChanges() { 
    //checks if changes have been made - if so, update the game
    if (this.checkForChanges()) {
      this.currentGame.rightAnswer = document.getElementById('button1').innerText;
      this.currentGame.answer1 = document.getElementById('button2').innerText;
      this.currentGame.answer2 = document.getElementById('button3').innerText;
      this.currentGame.answer3 = document.getElementById('button4').innerText;
      this.currentGame.question = document.getElementById('question').innerText;
      this.currentGame.photoID = this.imageURL;
      console.log("image: ")
      console.log(this.imageURL)

      console.log("currentgame: ")
      console.log(this.currentGame)

      this.afs.updateTask(this.currentGame);

      this.saved = true;
      setTimeout(() => this.saved = false, 4000);
      
    }
  }

  // activated on click of left arrow - loades the previous game
  loadPreviousGame() {
    if(this.previousGames.length > 0) {
      this.currentGame = this.previousGames.pop();   
      this.question = this.currentGame.question;
      this.answers = [this.currentGame.rightAnswer, this.currentGame.answer1, this.currentGame.answer2, this.currentGame.answer3];
      this.imageURL = this.currentGame.photoID; 
      this.loaded = true;  
    }
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
    if(this.currentGame.rightAnswer == valueButton1 && 
       this.currentGame.answer1 == valueButton2 &&
       this.currentGame.answer2 == valueButton3 &&
       this.currentGame.answer3 == valueButton4 &&
       this.currentGame.question == question &&
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
}
