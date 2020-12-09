import { Component, OnInit } from '@angular/core';
import {CdkDragDrop, CdkDropList, CDK_DROP_LIST, copyArrayItem, DragDropModule, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { AppService } from 'src/app/services/app.service';
import {v4 as uuidv4} from 'uuid';
import { PersonalFormsGame } from 'src/app/models/PersonalFormsGame.model';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';

@Component({
  selector: 'app-personal-forms-game-edit',
  templateUrl: './personal-forms-game-edit.component.html',
  styleUrls: ['./personal-forms-game-edit.component.css']
})
export class PersonalFormsGameEditComponent implements OnInit {
  
  folderUID;
  currentGame: PersonalFormsGame
  unsavedChanges = false;
  valueButton1: string;
  valueButton2: string;
  valueButton3: string;
  valueButton4: string;
  valueButton5: string;
  valueButton6: string;
  question: string;
  audioURLQuestion: string;
  audioURLAnswer1: string;
  audioURLAnswer2: string;
  audioURLAnswer3: string;
  audioURLAnswer4: string;
  audioURLAnswer5: string;
  audioURLAnswer6: string;

  constructor(private afs: FirestoreDataService, private appService: AppService) { 
    this.appService.myGameData$.subscribe((data) => {
      this.folderUID = data;
    });
  }

  ngOnInit(): void {
  }

   Person = [
    {value:'ich', disabled: true},
    {value:'du', disabled: true},
    {value:'er/sie/es', disabled: true},
    {value:'wir', disabled: true},
    {value:'ihr', disabled: true},
    {value:'sie', disabled: true},
  ];

  saveChanges() {
    let uid = uuidv4();
    this.currentGame = new PersonalFormsGame(uid, 
      document.getElementById('question').innerText,
      document.getElementById('valueIch').innerText,
      document.getElementById('valueDu').innerText,
      document.getElementById('valueErSieEs').innerText,
      document.getElementById('valueWir').innerText,
      document.getElementById('valueIhr').innerText,
      document.getElementById('valueSie').innerText,
      this.folderUID)

      this.afs.updateTask(this.currentGame);
  }

  initSounds() {
    this.audioURLQuestion = this.currentGame.question[1]
    this.audioURLAnswer1 = this.currentGame.ich[1]
    this.audioURLAnswer2 = this.currentGame.du[1]
    this.audioURLAnswer3 = this.currentGame.erSieEs[1]
    this.audioURLAnswer4 = this.currentGame.wir[1]
    this.audioURLAnswer5 = this.currentGame.ihr[1]
    this.audioURLAnswer6 = this.currentGame.sie[1]
  }

  checkForChanges(): boolean{
    if(this.currentGame == undefined) return false;

    this.valueButton1 = document.getElementById('valueIch').innerText;
    this.valueButton2 = document.getElementById('valueDu').innerText;
    this.valueButton3 = document.getElementById('valueErSieEs').innerText;
    this.valueButton4 = document.getElementById('valueWir').innerText;
    this.valueButton5 = document.getElementById('valueIhr').innerText;
    this.valueButton6 = document.getElementById('valueSie').innerText;
    this.question = document.getElementById('question').innerText;

    if(this.currentGame.ich[0] == this.valueButton1 && 
      this.currentGame.du[0] == this.valueButton2 &&
      this.currentGame.erSieEs[0] == this.valueButton3 &&
      this.currentGame.wir[0] == this.valueButton4 &&
      this.currentGame.ihr[0] == this.valueButton5 &&
      this.currentGame.sie[0] == this.valueButton6 &&
      this.currentGame.question[0] == this.question &&
      this.currentGame.ich[1] == this.audioURLAnswer1 && 
      this.currentGame.du[1] == this.audioURLAnswer2 &&
      this.currentGame.erSieEs[1] == this.audioURLAnswer3 &&
      this.currentGame.wir[1] == this.audioURLAnswer4 &&
      this.currentGame.ihr[1] == this.audioURLAnswer5 &&
      this.currentGame.sie[1] == this.audioURLAnswer6 &&
      this.currentGame.question[1] == this.audioURLQuestion) {
       return false;
    }
  else {
    return true;
  }
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

  loadNextGame() {
  }

  loadPreviousGame() {
  }

}
