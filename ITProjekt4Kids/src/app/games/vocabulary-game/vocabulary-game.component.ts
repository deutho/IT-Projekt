import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/internal/operators/take';
import { Game } from 'src/app/models/game.model';
import { User } from 'src/app/models/users.model';
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
  response;
  evaluated = false;
  private roundsWon = 0;
  private totalrounds = 0;
  
  constructor(private afs: FirestoreDataService, private router: Router) { }

  async ngOnInit(){
    await this.afs.getCurrentUser().valueChanges().pipe(take(1)).toPromise()
      .then(data => this.currentUser = data[0]);

    await this.afs.getTasksofTeacherbyClass(this.currentUser.parent, '1A').valueChanges().pipe(take(1)).toPromise()
      .then(data => this.Games = data);

    this.shuffleArrayofGames();

    this.loadNextGame();
  }

  loadNextGame() {
    this.evaluated = false;
    if (this.Games.length > 0) {
        this.currentGame = this.Games.pop();
        
        this.loaded = true;

    }else {
      this.finishGames() 
    }
  }

  shuffleArrayofGames() {

    var currentIndex = this.Games.length, temporaryValue, randomIndex;

    
    while (0 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = this.Games[currentIndex];
        this.Games[currentIndex] = this.Games[randomIndex];
        this.Games[randomIndex] = temporaryValue;
    }

  }

  finishGames() {
    //TODO - Save Result in Firstore 
    //Inlay No More Questions
    this.router.navigate(['']);
  }

  evaluateGame(selection) {
    console.log(selection)
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
    this.router.navigate(['']);
  }

  nextOne() {
    this.loadNextGame();
  }

}
