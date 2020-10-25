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
  selection;
  response;
  private roundsplayed;
  
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
    if (this.Games.length >= 0) {
        this.currentGame = this.Games.pop();
        
        this.loaded = true;

    }else {
      this.finishGames() 
    }


  }

  shuffleArrayofGames() {

    var currentIndex = this.Games.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = this.Games[currentIndex];
        this.Games[currentIndex] = this.Games[randomIndex];
        this.Games[randomIndex] = temporaryValue;
    }

  }

  finishGames() {

    this.router.navigate(['']);

  }

  evaluateGame() {
    this.response = "fertig";
    this.loaded = false;
    //this.loadNextGame();
  }

  returnToMainMenu() {
    this.router.navigate(['']);
  }

}
