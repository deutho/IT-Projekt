import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/internal/operators/take';
import { Router } from '@angular/router';
import { Game } from 'src/app/models/game.model';
import { User } from 'src/app/models/users.model';
import { AppService } from 'src/app/services/app.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';

@Component({
  selector: 'app-vocabulary-game-edit',
  templateUrl: './vocabulary-game-edit.component.html',
  styleUrls: ['./vocabulary-game-edit.component.css']
})
export class VocabularyGameEditComponent implements OnInit {

  // global variables
  Games: Game[];
  currentGame: Game;
  currentUser: User;
  playedGames: Game[];
  loaded = undefined;
  answers: string[];
  imageURL = "";
  editingPicture = false;
  previousGames: Game[];
  folderID = "";
  question: string;

  constructor(private afs: FirestoreDataService, private router: Router, private appService: AppService, private dashboardService: DashboardService) {
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
    this.checkForChanges();
    if (this.Games.length > 0) {
        //check if first game or already playing
        if(this.currentGame != undefined) {
          this.previousGames.push(this.currentGame);
        }
        //get next Game
        this.currentGame = this.Games.pop();   
        //set values of HTML elements
        this.question = this.currentGame.question;
        this.answers = [this.currentGame.rightAnswer, this.currentGame.answer1, this.currentGame.answer2, this.currentGame.answer3];
        this.imageURL = this.currentGame.photoID; //in the meantime set the URL  
        //makes the HTML elements load new Data
        this.loaded = true;  
    }else {
      //check if first game or already playing
      if(this.currentGame != undefined) {
        this.previousGames.push(this.currentGame);
      }
      console.log("i am here")
      //fill with placeholder text
      this.question = "Hier die Frage eingeben!"
      this.answers = ['Richtige Antwort', 'Falsche Antwort 1', 'Falsche Antwort 2', 'Falsche Antwort 3'];
      this.imageURL = 'https://cdn.pixabay.com/photo/2017/01/18/17/39/cloud-computing-1990405_960_720.png';
      this.loaded = true;  
    }
    
  }

  loadPreviousGame() {
    if(this.previousGames.length > 0) {
      this.checkForChanges();
      if(this.currentGame != undefined)this.Games.push(this.currentGame);
      this.currentGame = this.previousGames.pop();   
      this.question = this.currentGame.question;
      this.answers = [this.currentGame.rightAnswer, this.currentGame.answer1, this.currentGame.answer2, this.currentGame.answer3];
      this.imageURL = this.currentGame.photoID; 
      this.loaded = true;  
    }
  }
  
  returnToMainMenu() {
    this.checkForChanges();
    var data = "mainMenu";
    this.appService.myComponent(data);
    this.dashboardService.changes();
    var header = "Hauptmenü"
    this.appService.myHeader(header);
  }

  checkForChanges(){
    if(this.currentGame == undefined) return;
    let valueButton1 = document.getElementById('button1').innerText;
    let valueButton2 = document.getElementById('button2').innerText;
    let valueButton3 = document.getElementById('button3').innerText;
    let valueButton4 = document.getElementById('button4').innerText;
    let question = document.getElementById('question').innerText;
    if(this.currentGame.rightAnswer == valueButton1 && 
       this.currentGame.answer1 == valueButton2 &&
       this.currentGame.answer2 == valueButton3 &&
       this.currentGame.answer3 == valueButton4 &&
       this.currentGame.answer1 == valueButton2 &&
       this.currentGame.question == question &&
       this.currentGame.photoID == this.imageURL) {
         //no changes have been made in this game instance
       }
    else {
      //this game instance has been modified
      console.log("different input")
    }
  }

  pictureEdited() {  
    //toggle to refresh correct image after inputting a new URL
    this.imageURL = (<HTMLInputElement>document.getElementById('URL')).value;
    this.editingPicture = false;       
  }
}
