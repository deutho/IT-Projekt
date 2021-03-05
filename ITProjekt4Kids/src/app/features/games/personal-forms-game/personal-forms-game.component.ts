import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import {CdkDragDrop, CdkDropList, CDK_DROP_LIST, copyArrayItem, DragDropModule, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { PersonalFormsGame } from 'src/app/models/PersonalFormsGame.model';
import { supportsPassiveEventListeners } from '@angular/cdk/platform';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import { take } from 'rxjs/internal/operators/take';
import { User } from 'src/app/models/users.model';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Folder } from 'src/app/models/folder.model';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
const starAnimation = trigger('starAnimation', [
  transition('* <=> *', [
    query(':enter',
      [style({ opacity: 0 }), stagger('200ms', animate('600ms ease-out', style({ opacity: 1 })))],
      { optional: true }
    ),
    query(':leave',
      animate('200ms', style({ opacity: 0 })),
      { optional: true}
    )
  ])
]);


@Component({
  selector: 'app-personal-forms-game',
  templateUrl: './personal-forms-game.component.html',
  styleUrls: ['./personal-forms-game.component.css'],
  animations: [starAnimation]
})
export class PersonalFormsGameComponent implements OnInit, OnDestroy {

  constructor(private afs: FirestoreDataService, private appService: AppService, private route: ActivatedRoute, private router: Router) {}

  
  Games: PersonalFormsGame[] = []
  currentUser: User;
  folder: Folder;
  currentGame: PersonalFormsGame
  folderID;
  answers: string[]
  evaluated = false;
  finished = false;
  allItemsAllocated = false;
  answerIsCorrect = false;
  loaded = false;
  totalNumberOfRounds = 0;
  noQuestionsInGame = false;
  roundsWon = 0;
  roundsLost = 0;
  roundsWonAnimation = [];
  roundsLostAnimation = [];
  speakerMode = false;
  checked : boolean = false
  teacherPlaying: boolean = false;
  audio = new Audio("");
  studentmode: boolean = true;
  dockey: string;
  studentmodesubscription;


  // boolean to detect if list already contains a string
  listOneEmpty = true;
  listTwoEmpty = true;
  listThreeEmpty = true;
  listFourEmpty = true;
  listFiveEmpty = true;
  listSixEmpty = true;

  //values of first (static) list
  Person = [
    {value:'ich', disabled: true},
    {value:'du', disabled: true},
    {value:'er/sie/es', disabled: true},
    {value:'wir', disabled: true},
    {value:'ihr', disabled: true},
    {value:'sie', disabled: true},
  ];

  //empty lists to represent placeholders, i.e. one array of the length six 
  items1 = [];
  items2 = [];
  items3 = [];
  items4 = [];
  items5 = [];
  items6 = [];

  async ngOnInit(): Promise<void> {
    await this.afs.getCurrentUser().then(data => this.currentUser = data[0]);

    this.folderID = this.route.snapshot.paramMap.get('id');

    this.dockey = this.route.snapshot.queryParamMap.get('k');

    await this.afs.getFolderElement(this.dockey).then(data => {
      let f: Folder[]  = data.folders;
      f.forEach(folder => {
        if (folder.uid == this.folderID) this.folder = folder
      });
    }).catch(() => this.router.navigate(['notfound'], {replaceUrl: true}))

    if (this.folder == undefined) {
      this.router.navigate(['notfound'], {replaceUrl: true});
    } else {

      //evaluate if teacher is playing
      if (this.currentUser.role == 2) this.teacherPlaying == true;

      //set the header
      this.appService.myHeader(this.folder.name);

      await this.afs.getTasksPerID(this.folderID).then(data => this.Games = data);
      this.shuffleArray(this.Games)
      this.loadNextGame()
      this.totalNumberOfRounds = this.Games.length+1; 
    }

    this.studentmodesubscription = this.appService.myStudentMode$.subscribe((data) => {
      if (this.currentUser.role == 2 && data != this.studentmode)
      this.router.navigate(['game/'+this.folderID], {queryParams:{k: this.dockey, t: 'personal-forms-game'}, replaceUrl: true});
    });
  }

  //method to evaluate if something can be dropped in the list/field
  canDrop() {
    return false;
  }

  drop(event: CdkDragDrop<string[]>) {
    console.log(event)
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      //if list is full and is not the list that has the initialized values, don't insert
      
      
      if(event.container.data.length > 0 && event.container.id != "selection") {}     

      else{
        // insert

        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);
             

          if(event.previousContainer.id == "selection"){
            this.answers.push('')
          }          
          if(event.previousContainer.id == "listOne") {
            this.listOneEmpty = true;
          }
          if(event.container.id == "listOne") {
            this.listOneEmpty = false;
          }
          if(event.previousContainer.id == "listTwo") {
            this.listTwoEmpty = true;
          }
          if(event.container.id == "listTwo") {
            this.listTwoEmpty = false;
          }
          if(event.previousContainer.id == "listThree") {
            this.listThreeEmpty = true;
          }
          if(event.container.id == "listThree") {
            this.listThreeEmpty = false;
          }
          if(event.previousContainer.id == "listFour") {
            this.listFourEmpty = true;
          }
          if(event.container.id == "listFour") {
            this.listFourEmpty = false;
          }
          if(event.previousContainer.id == "listFive") {
            this.listFiveEmpty = true;
          }
          if(event.container.id == "listFive") {
            this.listFiveEmpty = false;
          }
          if(event.previousContainer.id == "listSix") {
            this.listSixEmpty = true;
          }
          if(event.container.id == "listSix") {
            this.listSixEmpty = false;
          }
      }

      if(event.container.id == "selection") {
        console.log('3');
        let index = event.container.data.indexOf('');
        if(index != -1 && event.currentIndex > index) {
          let temp = this.answers[event.currentIndex]
          this.answers[event.currentIndex] = this.answers[index]
          this.answers[index] = temp
          this.answers.pop()
        }
        else if(index != -1) {
          this.answers.pop()
        } 
      }
    }
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

  loadNextGame() {
    this.evaluated = false;
    this.checked = false;
    
    if (this.Games.length > 0) {
        this.currentGame = this.Games.pop();      
        console.log(this.currentGame)         
        this.answers = [
          this.currentGame.ich[0],
          this.currentGame.du[0],
          this.currentGame.erSieEs[0],
          this.currentGame.wir[0],
          this.currentGame.ihr[0],
          this.currentGame.sie[0],
        ];
        this.shuffleArray(this.answers); 
        this.loaded = true;
        //clear second column
        this.items1 = [];
        this.items2 = [];
        this.items3 = [];
        this.items4 = [];
        this.items5 = [];
        this.items6 = [];

        // boolean to show moveable list again
        this.listOneEmpty = true;
        this.listTwoEmpty = true;
        this.listThreeEmpty = true;
        this.listFourEmpty = true;
        this.listFiveEmpty = true;
        this.listSixEmpty = true;
        this.answerIsCorrect = false;
    }
    else {
      this.finishGame() 
    }
  }
     

  checkIfAllItemsAllocated(){
    if(this.items1.length == 0 || this.items2.length == 0 || this.items3.length == 0 || this.items4.length == 0 || this.items5.length == 0 || this.items6.length == 0){
      this.allItemsAllocated = true;
      setTimeout(() => this.allItemsAllocated = false, 2500);
      return false;
    }
    else{
      return true;
    }
  }


  evaluateGame(){ 
    
    let proceedEvaluation = this.checkIfAllItemsAllocated();

    if(proceedEvaluation == true){
      this.answerIsCorrect = false;
      var correctAnswers = [this.currentGame.ich[0], this.currentGame.du[0], this.currentGame.erSieEs[0], this.currentGame.wir[0], this.currentGame.ihr[0], this.currentGame.sie[0]];

      var Result = []
      
      let ich = (<HTMLElement>document.getElementById('box1'))
      let du = (<HTMLElement>document.getElementById('box2'))
      let erSieEs = (<HTMLElement>document.getElementById('box3'))
      let wir = (<HTMLElement>document.getElementById('box4'))
      let ihr = (<HTMLElement>document.getElementById('box5'))
      let sie = (<HTMLElement>document.getElementById('box6'))

      if (ich.innerText == correctAnswers[0]) {
        Result[0] = "richtig";
        ich.setAttribute("style","background-color:#52FF82;")
      }
      else {
        Result[0] = "falsch";
        ich.setAttribute("style", "background-color:#FF7171;")
      }

      if (du.innerText == correctAnswers[1]) {
        Result[1] = "richtig";
        du.setAttribute("style","background-color:#52FF82;")
      }
      else {
      Result[1] = "falsch";
      du.setAttribute("style", "background-color:#FF7171;")
      }

      if (erSieEs.innerText == correctAnswers[2]) {
        Result[2] = "richtig";
        erSieEs.setAttribute("style","background-color:#52FF82;")
      }
      else {
      Result[2] = "falsch";
      erSieEs.setAttribute("style", "background-color:#FF7171;")
      }

      if (wir.innerText == correctAnswers[3]) {
        Result[3] = "richtig";
        wir.setAttribute("style","background-color:#52FF82;")
      }
      else {
      Result[3] = "falsch";
      wir.setAttribute("style", "background-color:#FF7171;")
      }

      if (ihr.innerText == correctAnswers[4]) {
        Result[4] = "richtig";
        ihr.setAttribute("style","background-color:#52FF82;")
      }
      else {
      Result[4] = "falsch";
      ihr.setAttribute("style", "background-color:#FF7171;")
      }

      if (sie.innerText == correctAnswers[5]) {
        Result[5] = "richtig";
        sie.setAttribute("style","background-color:#52FF82;")
      }
      else {
      Result[5] = "falsch";
      sie.setAttribute("style", "background-color:#FF7171;")
      }
      let tempAnswerChecker = true;
      for( let i in Result) {
        if(Result[i] == "falsch") tempAnswerChecker = false;
      }

      //there is only one evaluation, but infinte trys to pass the game
        if(tempAnswerChecker == true){
          this.answerIsCorrect = true;
          if(!this.evaluated && this.checked == false) this.roundsWon++;
          this.evaluated = true;
          this.checked = true
          //Stimme "Du hast das toll gemacht!" 
        }else{
          if(!this.evaluated && this.checked == false) this.roundsLost++;
          this.checked = true
          this.evaluated == false
          //Stimme "Oje, probier es noch einmal, du schaffst das!"
        }   
      
    }
  }

  finishGame() {
    if(this.totalNumberOfRounds > 0) {
      // this.endtime = Date.now();
      // this.duration = this.endtime-this.starttime;
      // this.afs.createResult(this.currentUser.uid, this.totalrounds, this.roundsWon, this.folderID, this.duration);
      this.finished = true;
      this.finalScreen()
    }
    else this.noQuestionsInGame = true;
  }

  finalScreen(){
    this.roundsWonAnimation = [].constructor(this.roundsWon);
    this.roundsLostAnimation = [].constructor(this.roundsLost);
  }

  happyFace() {
    if((this.totalNumberOfRounds - this.roundsLost)/this.totalNumberOfRounds >= 0.5 ) {
      return true; //more than 50% correct
    }
    else return false;
  }

  switchMode() {
    this.loaded = false;
    this.speakerMode = !this.speakerMode;
    const demoClasses = document.querySelectorAll('.example-box');
    if(this.speakerMode == true) {      
      demoClasses.forEach(element => {
        element.setAttribute("style", "cursor: default")
      });
    }
    else{
      demoClasses.forEach(element => {
        element.setAttribute("style", "cursor: move")
      });
    }
    this.loaded = true;
    // this.updateColorhelper();
  }
  
  allowDrag(){
    if(this.speakerMode) return true;
    return false;
  }

  playSound(soundfile) {
    console.log(this.speakerMode)
    if(this.speakerMode == false) return;
    interface keyMap {
      [key: string]: string;
    } 
    let answerMap:keyMap = {};
    answerMap[this.currentGame.ich[0]] = this.currentGame.ich[1]
    answerMap[this.currentGame.du[0]] = this.currentGame.du[1]
    answerMap[this.currentGame.erSieEs[0]] = this.currentGame.erSieEs[1]
    answerMap[this.currentGame.wir[0]] = this.currentGame.wir[1]
    answerMap[this.currentGame.ihr[0]] = this.currentGame.ihr[1]
    answerMap[this.currentGame.sie[0]] = this.currentGame.sie[1]
    answerMap[this.currentGame.question[0]] = this.currentGame.question[1]
    this.audio = new Audio(answerMap[soundfile]);
    this.audio.play();
  }

  goBack() {
    this.router.navigate(['']);
  }

  ngOnDestroy() {
    if (this.studentmodesubscription != undefined) this.studentmodesubscription.unsubscribe(); 
  }
}
