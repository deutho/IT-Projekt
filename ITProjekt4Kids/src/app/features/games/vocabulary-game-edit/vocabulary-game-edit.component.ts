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

  Games: Game[];
  currentGame: Game;
  currentUser: User;
  playedGames: Game[];
  loaded = undefined;
  answers: string[];
  imageURL = "";
  editingPicture = false;
  previousGames: Game[];


  constructor(private afs: FirestoreDataService, private router: Router, private appService: AppService, private dashboardService: DashboardService) { }

  async ngOnInit(): Promise<void> {
    await this.afs.getCurrentUser().valueChanges().pipe(take(1)).toPromise()
      .then(data => this.currentUser = data[0]);
    await this.afs.getTasksofTeacherbyClass(this.currentUser.uid, '1A').valueChanges().pipe(take(1)).toPromise()
      .then(data => this.Games = data);
    let previousGames = [];
    this.previousGames = previousGames;
    this.loadNextGame();
  }

  loadNextGame() {    
    //check for change - beware of undefined if first game
    if (this.Games.length > 0) {
        if(this.currentGame != undefined) {
          this.previousGames.push(this.currentGame);
        }
        this.currentGame = this.Games.pop();   
        this.answers = [this.currentGame.rightAnswer, this.currentGame.answer1, this.currentGame.answer2, this.currentGame.answer3];
        this.imageURL = this.currentGame.photoID; //in the meantime set the URL  
        this.loaded = true;  
    }else {
      if(this.currentGame != undefined) {
        this.previousGames.push(this.currentGame);
      }
      this.answers = ['Richtige Antwort', 'Falsche Antwort 1', 'Falsche Antwort 2', 'Falsche Antwort 3'];
        this.imageURL = 'https://cdn.pixabay.com/photo/2017/01/18/17/39/cloud-computing-1990405_960_720.png'; //in the meantime set the URL  
        this.loaded = true;  
      //this.finishGames() 
    }
    
  }

  loadPreviousGame() {
    if(this.previousGames.length > 0) {
      //check for change
      if(this.currentGame != undefined)this.Games.push(this.currentGame);
      this.currentGame = this.previousGames.pop();   
      this.answers = [this.currentGame.rightAnswer, this.currentGame.answer1, this.currentGame.answer2, this.currentGame.answer3];
      this.imageURL = this.currentGame.photoID; //in the meantime set the URL  
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
    this.imageURL = (<HTMLInputElement>document.getElementById('URL')).value;
    this.editingPicture = false;       
  }

}
