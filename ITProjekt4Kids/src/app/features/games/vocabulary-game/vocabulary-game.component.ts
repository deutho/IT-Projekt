import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/internal/operators/take';
import { Game } from 'src/app/models/game.model';
import { User } from 'src/app/models/users.model';
import { AppService } from 'src/app/services/app.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';

@Component({
  selector: 'app-vocabulary-game',
  templateUrl: './vocabulary-game.component.html',
  styleUrls: ['./vocabulary-game.component.css']
})
export class VocabularyGameComponent implements OnInit {

  Games: Game[];
  currentGame: Game;
  currentUser: User;
  playedGames: Game[];
  loaded = undefined;
  selection: string;
  answers: string[];
  imageURL = "";
  response;
  evaluated = false;
  private roundsWon = 0;
  private totalrounds = 0;
  
  constructor(private afs: FirestoreDataService, private router: Router, private appService: AppService, private dashboardService: DashboardService) { }

  async ngOnInit(){
    await this.afs.getCurrentUser().valueChanges().pipe(take(1)).toPromise()
      .then(data => this.currentUser = data[0]);

    await this.afs.getTasksofTeacherbyClass(this.currentUser.parent, '1A').valueChanges().pipe(take(1)).toPromise()
      .then(data => this.Games = data);

    this.shuffleArray(this.Games);

    this.loadNextGame();
  }

  loadNextGame() {
    this.evaluated = false;
    if (this.Games.length > 0) {
        this.currentGame = this.Games.pop();

        this.shuffleAnswers();

        this.loaded = true;
        
    }else {
      this.finishGames() 
    }
  }

  shuffleAnswers() {
    this.answers = [this.currentGame.answer1, this.currentGame.answer2, this.currentGame.answer3, this.currentGame.rightAnswer];
    this.imageURL = this.currentGame.photoID; //in the meantime set the URL
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
    //TODO - Save Result in Firstore 
    //Inlay No More Questions
    //To the next session? Back To Game Menu in Folder where left off?
    var data = "mainMenu";
    this.appService.myComponent(data);
    this.dashboardService.changes();
    var header = "Hauptmenü"
    this.appService.myHeader(header);
  }

  evaluateGame(selection) {
    if (selection === this.currentGame.rightAnswer) {
      this.response = "Richtig!!";
      this.roundsWon++
      this.totalrounds++;
    }else{
      this.response = "Falsch!";
      this.totalrounds++;
    }

    this.evaluated = true;
  }

  returnToMainMenu() {
    var data = "mainMenu";
    this.appService.myComponent(data);
    this.dashboardService.changes();
    var header = "Hauptmenü"
    this.appService.myHeader(header);
  }

  nextOne() {
    this.loadNextGame();
  }
 
}
