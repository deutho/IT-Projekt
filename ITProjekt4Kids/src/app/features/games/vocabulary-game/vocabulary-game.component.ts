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
  finished = false;
  roundsWon = 0;
  totalrounds = 0;
  folderID;


  
  constructor(private afs: FirestoreDataService, private router: Router, private appService: AppService, private dashboardService: DashboardService) {
    this.appService.myGameData$.subscribe((data) => {
      this.folderID = data;
    });
   }

  async ngOnInit(){
    await this.afs.getCurrentUser().valueChanges().pipe(take(1)).toPromise()
      .then(data => this.currentUser = data[0]);

      console.log(this.folderID);
    await this.afs.getTasksPerID(this.folderID).valueChanges().pipe(take(1)).toPromise()
      .then(data => this.Games = data);

    this.shuffleArray(this.Games);

    this.loadNextGame();
    setTimeout(() => (<HTMLInputElement>document.getElementById('progressRange')).max = String(this.Games.length + 1));
    this.updateColorhelper();
    console.log(this.Games.length);
    
  }

  startSubscription() {
    
  }

  updateColorhelper() {
    console.log(this.answers);
    setTimeout(() => {      
      this.updateColor("button1");
      this.updateColor("button2");
      this.updateColor("button3");
      this.updateColor("button4");
      this.updateColor("question");
      (<HTMLInputElement>document.getElementById('progressRange')).value = String(this.totalrounds+1);
    }) 
  }

  loadNextGame() {
    this.evaluated = false;

    if (this.Games.length > 0) {
        this.currentGame = this.Games.pop();
        this.shuffleAnswers();        
        this.loaded = true;  
        this.updateColorhelper();   
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
    this.finished = true;
  }

  goBack() {
    var data = "mainMenu";
    this.appService.myComponent(data);
    this.dashboardService.changes();
    var header = "Hauptmenü"
    this.appService.myHeader(header);
  
  }

  evaluateGame(selection) {
    let correctAnswer;
    if (selection === this.currentGame.rightAnswer) {
      this.response = "Richtig!!";
      this.roundsWon++
      this.totalrounds++;
      correctAnswer = true;
    }else{
      this.response = "Falsch!";
      this.totalrounds++;
      correctAnswer = false;
    }

    this.evaluated = true;
    return correctAnswer;
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
    (<HTMLInputElement>document.getElementById('button1')).setAttribute("style", "background-color:white;");
    (<HTMLInputElement>document.getElementById('button2')).setAttribute("style", "background-color:white;");
    (<HTMLInputElement>document.getElementById('button3')).setAttribute("style", "background-color:white;");
    (<HTMLInputElement>document.getElementById('button4')).setAttribute("style", "background-color:white;");
  }

  buttonOne(answer:string) {
    if(!this.evaluated) {
      let correctAnswer = this.evaluateGame(answer);
      let button = (<HTMLInputElement>document.getElementById('button1'))
      if (correctAnswer) {
        button.setAttribute("style", "background-color:#52FF82;");
      }
      else {
        button.setAttribute("style", "background-color:#FF7171;");
        let button1 = (<HTMLInputElement>document.getElementById('button1'))
        let button2 = (<HTMLInputElement>document.getElementById('button2'))
        let button3 = (<HTMLInputElement>document.getElementById('button3'))
        let button4 = (<HTMLInputElement>document.getElementById('button4'))        
        if(button1.value == this.currentGame.rightAnswer){
          button1.setAttribute("style", "background-color:#52FF82;");
        }
        else if(button2.value == this.currentGame.rightAnswer){
          button2.setAttribute("style", "background-color:#52FF82;");
        }
        else if(button3.value == this.currentGame.rightAnswer){
          button3.setAttribute("style", "background-color:#52FF82;");
        }
        else if(button4.value == this.currentGame.rightAnswer){
          button4.setAttribute("style", "background-color:#52FF82;");
        }
      }
    }
  }
 
  buttonTwo(answer:string) {
    if(!this.evaluated) {
      let correctAnswer = this.evaluateGame(answer);
      let button = (<HTMLInputElement>document.getElementById('button2'))
      if (correctAnswer) {
        button.setAttribute("style", "background-color:#52FF82;");
      }
      else {
        button.setAttribute("style", "background-color:#FF7171;");
        let button1 = (<HTMLInputElement>document.getElementById('button1'))
        let button2 = (<HTMLInputElement>document.getElementById('button2'))
        let button3 = (<HTMLInputElement>document.getElementById('button3'))
        let button4 = (<HTMLInputElement>document.getElementById('button4'))
        if(button1.value == this.currentGame.rightAnswer){
          button1.setAttribute("style", "background-color:#52FF82;");
        }
        else if(button2.value == this.currentGame.rightAnswer){
          button2.setAttribute("style", "background-color:#52FF82;");
        }
        else if(button3.value == this.currentGame.rightAnswer){
          button3.setAttribute("style", "background-color:#52FF82;");
        }
        else if(button4.value == this.currentGame.rightAnswer){
          button4.setAttribute("style", "background-color:#52FF82;");
        }
      }
    }
  }
  buttonThree(answer:string) {
    if(!this.evaluated) {
      let correctAnswer = this.evaluateGame(answer);
      let button = (<HTMLInputElement>document.getElementById('button3'))
      if (correctAnswer) {
        button.setAttribute("style", "background-color:#52FF82;");
      }
      else {
        button.setAttribute("style", "background-color:#FF7171;");
        let button1 = (<HTMLInputElement>document.getElementById('button1'))
        let button2 = (<HTMLInputElement>document.getElementById('button2'))
        let button3 = (<HTMLInputElement>document.getElementById('button3'))
        let button4 = (<HTMLInputElement>document.getElementById('button4'))
        if(button1.value == this.currentGame.rightAnswer){
          button1.setAttribute("style", "background-color:#52FF82;");
        }
        else if(button2.value == this.currentGame.rightAnswer){
          button2.setAttribute("style", "background-color:#52FF82;");
        }
        else if(button3.value == this.currentGame.rightAnswer){
          button3.setAttribute("style", "background-color:#52FF82;");
        }
        else if(button4.value == this.currentGame.rightAnswer){
          button4.setAttribute("style", "background-color:#52FF82;");
        }
      }
    }
  }
  buttonFour(answer:string) {
    if(!this.evaluated) {
      let correctAnswer = this.evaluateGame(answer);
      let button = (<HTMLInputElement>document.getElementById('button4'))
      if (correctAnswer) {
        button.setAttribute("style", "background-color:#52FF82;");
      }
      else {
        button.setAttribute("style", "background-color:#FF7171;");
        let button1 = (<HTMLInputElement>document.getElementById('button1'))
        let button2 = (<HTMLInputElement>document.getElementById('button2'))
        let button3 = (<HTMLInputElement>document.getElementById('button3'))
        let button4 = (<HTMLInputElement>document.getElementById('button4'))
        if(button1.value == this.currentGame.rightAnswer){
          button1.setAttribute("style", "background-color:#52FF82;");
        }
        else if(button2.value == this.currentGame.rightAnswer){
          button2.setAttribute("style", "background-color:#52FF82;");
        }
        else if(button3.value == this.currentGame.rightAnswer){
          button3.setAttribute("style", "background-color:#52FF82;");
        }
        else if(button4.value == this.currentGame.rightAnswer){
          button4.setAttribute("style", "background-color:#52FF82;");
          console.log(button4.value)
        }
      }
    }
  }

  updateColor(id) {
    var text = document.getElementById(id);
    var str = (<HTMLInputElement>text).value,
        reg = /red|blue|green/ig; //g is to replace all occurances

    //fixing a bit
    var toStr = String(reg);
    var color = (toStr.replace('\/g', '|')).substring(1);

    //split it baby
    var colors = color.split("|");

    if (colors.indexOf("red") > -1) {
        str = str.replace(/die/g, '<span style="color:red;">die</span>');
    }

    if (colors.indexOf("blue") > -1) {
        str = str.replace(/der/g, '<span style="color:blue;">der</span>');
    }

    if (colors.indexOf("green") > -1) {
        str = str.replace(/das/g, '<span style="color:green;">das</span>');
    }

    if (colors.indexOf("red") > -1) {
      str = str.replace(/Die/g, '<span style="color:red;">Die</span>');
    }

    if (colors.indexOf("blue") > -1) {
        str = str.replace(/Der/g, '<span style="color:blue;">Der</span>');
    }

    if (colors.indexOf("green") > -1) {
        str = str.replace(/Das/g, '<span style="color:green;">Das</span>');
    }


    document.getElementById(id).innerHTML = str;
  }

}
