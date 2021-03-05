import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { take } from 'rxjs/internal/operators/take';
import { ActivatedRoute, Router } from '@angular/router';
import { VocabularyGame } from 'src/app/models/VocabularyGame.model';
import { User } from 'src/app/models/users.model';
import { AppService } from 'src/app/services/app.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import {v4 as uuidv4} from 'uuid';
import { RecordRTCService } from 'src/app/services/record-rtc.service';
import { Folder } from 'src/app/models/folder.model';

@Component({
  selector: 'app-vocabulary-game-edit',
  templateUrl: './vocabulary-game-edit.component.html',
  styleUrls: ['./vocabulary-game-edit.component.css']
})
export class VocabularyGameEditComponent implements OnInit, OnDestroy {

  // global variables
  Games: VocabularyGame[];
  currentGame: VocabularyGame;
  currentUser: User;
  loaded = false;
  answers: string[];
  folder: Folder;
  imageURL = "";
  editingPicture = false;
  previousGames: VocabularyGame[] = [];
  folderID = "";
  question: string;
  saved;
  noChanges;
  unsavedChanges = false;
  isDefault = false;
  finalScreen = false;
  noMoreGames = false;
  audioURL: string;
  audioURLQuestion: string;
  audioURLAnswer1: string;
  audioURLAnswer2: string;
  audioURLAnswer3: string;
  audioURLAnswer4: string;
  selectedDOMElement: HTMLElement;
  triggeredHTML: string;
  editingAudio = false;
  valueButton1: string;
  valueButton2: string;
  valueButton3: string;
  valueButton4: string;
  isRecording = false;
  showMaxRecordingWarning = false;
  audioQuestionPlaying = false;
  audioAnswer1Playing = false;
  audioAnswer2Playing = false;
  audioAnswer3Playing = false;
  audioAnswer4Playing = false;
  recordingTimeout;
  default = false;
  nextCountNumber: number;
  checkstate: boolean;
  coloring = true;
  deleteElementOverlay = false;
  unauthorized: boolean = false;
  isOwner: boolean = false;
  isEditor: boolean = false;
  isViewer: boolean = false;
  image = new Image();
  imageLoaded: boolean = false; 
  dockey: string;
  studentmode: boolean = false;
  studentmodesubscription;
  audioURLSubscription: any;
  imageURLSubscription: any;

  constructor(private afs: FirestoreDataService, private router: Router, private appService: AppService, public _recordRTC:RecordRTCService, private route: ActivatedRoute) {
    
    this.imageURLSubscription = this.appService.myImageURL$.subscribe((data) => {
      this.imageURL = data;
      this.pictureEdited(data)
    });    
    this.audioURLSubscription = this._recordRTC.downloadURL$.subscribe((data) => {
      this.audioURL = data;
      if((<HTMLButtonElement> document.getElementById("audioButtonQuestion")) != null) {
        this.allowRecord(true);        
      }
      this.loadAudio();
      // console.log("hellloooo")
    })

  }

  async ngOnInit(): Promise<void> {

  
    //get user
    await this.afs.getCurrentUser().then(data => this.currentUser = data[0]);

    if(this.currentUser.role == 3) {
      this.unauthorized = true;
    } else {
        this.folderID = this.route.snapshot.paramMap.get('id');
        this.dockey = this.route.snapshot.queryParamMap.get('k');
    
        //get the data of the game
        await this.afs.getFolderElement(this.dockey).then(data => {
          let f: Folder[]  = data.folders;
          f.forEach(folder => {
            if (folder.uid == this.folderID) this.folder = folder
          });
        }).catch(() => this.router.navigate(['notfound'], {replaceUrl: true}))

        if (this.folder == undefined) {
          this.router.navigate(['notfound'], {replaceUrl: true});
        } else {

          //get the rights (Thomas, mit de 2 bools kannst arbeiten - isViewer is eh imma true - jeder kann viewen)
          if (this.folder.owner == this.currentUser.uid) this.isOwner = true;
          if (this.folder.editors.includes(this.currentUser.uid)) this.isEditor = true;
          if(this.isOwner == false && this.isEditor == false) this.isViewer = true;
          
          //set the header
          this.appService.myHeader(this.folder.name);    
        
          // get games
          await this.afs.getTasksPerID(this.folderID).then(data => this.Games = data);

          //set numbers
          this.nextCountNumber = 0;
          //if already questions in the game
          if (this.Games.length != 0) {
            let numbers: number[] = [];
            this.Games.forEach(element => {
              numbers.push(element.number);
            });
            //calculate the next number
            this.nextCountNumber = Math.max(...numbers)+1;
          }
          
          //sort array by number
          this.Games.sort((a, b) => {return b.number - a.number});
          
          //load first game
          if (this.Games.length == 0) this.initializeNewQuestion();
          else this.loadNextGame(true);
        }
      }
      //Observable for the live studentmode change
      
        this.studentmodesubscription = this.appService.myStudentMode$.subscribe((data) => {
            if (this.currentUser.role == 2 && data != this.studentmode)
            this.router.navigate(['game/'+this.folderID], {queryParams:{k: this.dockey, t: 'vocabular-game'}, replaceUrl: true});
        });
      
  }
  
  startVoiceRecord(HTMLFinder){
    this.triggeredHTML = HTMLFinder;
    this._recordRTC.toggleRecord(this.currentGame.uid);
    clearTimeout(this.recordingTimeout)
    this.recordingTimeout = window.setTimeout(() => {
        this.startVoiceRecord(HTMLFinder);
        this.showMaxRecordingWarning = true;
        setTimeout(() => this.showMaxRecordingWarning = false, 4000)
    }, 10800);
    this.toggleLockedHTML();
  }

  toggleLockedHTML() {
    if(this.isRecording) {
      this.isRecording = false;
      //unlock all audioButtonAnswer0 audioButtonQuestion
      (<HTMLButtonElement> document.getElementById("audioButtonQuestion")).disabled = false;
      (<HTMLButtonElement> document.getElementById("audioButtonAnswer0")).disabled = false;
      (<HTMLButtonElement> document.getElementById("audioButtonAnswer1")).disabled = false;
      (<HTMLButtonElement> document.getElementById("audioButtonAnswer2")).disabled = false;
      (<HTMLButtonElement> document.getElementById("audioButtonAnswer3")).disabled = false;
      clearTimeout(this.recordingTimeout)
      this.allowRecord(false);
    }
    else{
      this.isRecording = true;
      //lock all except correct one
      if(this.triggeredHTML != 'question')(<HTMLButtonElement> document.getElementById("audioButtonQuestion")).disabled = true;
      if(this.triggeredHTML != 'answer1')(<HTMLButtonElement> document.getElementById("audioButtonAnswer0")).disabled = true;
      if(this.triggeredHTML != 'answer2')(<HTMLButtonElement> document.getElementById("audioButtonAnswer1")).disabled = true;
      if(this.triggeredHTML != 'answer3')(<HTMLButtonElement> document.getElementById("audioButtonAnswer2")).disabled = true;
      if(this.triggeredHTML != 'answer4')(<HTMLButtonElement> document.getElementById("audioButtonAnswer3")).disabled = true;
    }
  }

  allowRecord (allowed) {
    console.log("allowRecord")
    if(allowed == true) {
      console.log("allowRecord = true");
      (<HTMLButtonElement> document.getElementById("audioButtonQuestion")).disabled = false;
      (<HTMLButtonElement> document.getElementById("audioButtonAnswer0")).disabled = false;
      (<HTMLButtonElement> document.getElementById("audioButtonAnswer1")).disabled = false;
      (<HTMLButtonElement> document.getElementById("audioButtonAnswer2")).disabled = false;
      (<HTMLButtonElement> document.getElementById("audioButtonAnswer3")).disabled = false;
    }
    else {
      (<HTMLButtonElement> document.getElementById("audioButtonQuestion")).disabled = true;
      (<HTMLButtonElement> document.getElementById("audioButtonAnswer0")).disabled = true;
      (<HTMLButtonElement> document.getElementById("audioButtonAnswer1")).disabled = true;
      (<HTMLButtonElement> document.getElementById("audioButtonAnswer2")).disabled = true;
      (<HTMLButtonElement> document.getElementById("audioButtonAnswer3")).disabled = true;
    }
  }

  loadAudio(){
    if(this.triggeredHTML == 'question') {
      this.audioURLQuestion = this.audioURL;
    }
    else if(this.triggeredHTML == 'answer1') {
      this.audioURLAnswer1 = this.audioURL;
    }
    else if(this.triggeredHTML == 'answer2') {
      this.audioURLAnswer2 = this.audioURL;
    }
    else if(this.triggeredHTML == 'answer3') {
      this.audioURLAnswer3 = this.audioURL;
    }
    else if(this.triggeredHTML == 'answer4') {
      this.audioURLAnswer4 = this.audioURL;
    }
  }

  initSounds() {
    this.audioURLQuestion = this.currentGame.question[1]
    this.audioURLAnswer1 = this.currentGame.rightAnswer[1]
    this.audioURLAnswer2 = this.currentGame.answer1[1]
    this.audioURLAnswer3 = this.currentGame.answer2[1]
    this.audioURLAnswer4 = this.currentGame.answer3[1]
  }
  playAudio(htmlSource) {
    console.log(this.audioURLAnswer1);
    (<HTMLAudioElement>document.getElementById('player' + htmlSource)).play();
    setTimeout(() => {
      this.stopAudio(htmlSource);
    }, (<HTMLAudioElement>document.getElementById('player' + htmlSource)).duration*1000);
    
    if(htmlSource == 'question') {
      this.audioQuestionPlaying = true;
    }
    else if(htmlSource == 'answer1') {
      this.audioAnswer1Playing = true;
    }
    else if(htmlSource == 'answer2') {
      this.audioAnswer2Playing = true;
    }
    else if(htmlSource == 'answer3') {
      this.audioAnswer3Playing = true;
    }
    else if(htmlSource == 'answer4') {
      this.audioAnswer4Playing = true;
    }

  }

  stopAudio(htmlSource) {
    (<HTMLAudioElement>document.getElementById('player' + htmlSource)).pause()
    if(htmlSource == 'question') {
      this.audioQuestionPlaying = false;
    }
    else if(htmlSource == 'answer1') {
      this.audioAnswer1Playing = false;
    }
    else if(htmlSource == 'answer2') {
      this.audioAnswer2Playing = false;
    }
    else if(htmlSource == 'answer3') {
      this.audioAnswer3Playing = false;
    }
    else if(htmlSource == 'answer4') {
      this.audioAnswer4Playing = false;
    }
    clearTimeout(this.recordingTimeout)
  }

  initializeNewQuestion() {
      this.finalScreen = true;
      let uid = uuidv4();
      // https://ipsumimage.appspot.com/900x600,F5F4F4?l=|Klicke+hier,|um+ein+Bild+einzuf%C3%BCgen!||&s=67
      this.currentGame = new VocabularyGame(uid, ['Falsche Antwort 1',''], ['Falsche Antwort 2',''], ['Falsche Antwort 3',''], ['Richtige Antwort', ''], ["Hier die Frage eingeben", ''], './../../../../assets/Images/Placeholder-Image/north_blur_Text.png', this.folderID, this.nextCountNumber, this.coloring); 
      this.nextCountNumber++;
      this.default = true; 
      this.question = this.currentGame.question[0];
      this.answers = [this.currentGame.rightAnswer[0], this.currentGame.answer1[0], this.currentGame.answer2[0], this.currentGame.answer3[0]];
      this.imageURL = this.currentGame.photoID;
      this.initSounds();
      this.loaded = true;
  }

  loadNextGame(nopush?: boolean) {   
    this.loaded = false;
    console.log(this.Games.length)
    if((this.finalScreen && this.Games.length == 0) || (this.isViewer && this.Games.length == 0))   {
      this.noMoreGames = true;
      this.loaded = true;
      setTimeout(() => this.noMoreGames = false, 2500);
      return; //maybe add some feedback here
    } else {
      if (!nopush) this.previousGames.push(this.currentGame)

      // if game has some pages to be played left
      if (this.Games.length > 0) {
      this.currentGame = this.Games.pop();  
      this.default = false;
      }   
        
      // if game is empty, or you clicked past the last page in the game
      else  this.initializeNewQuestion();

      // set values for question, answers and photo-url
      this.question = this.currentGame.question[0];
      this.answers = [this.currentGame.rightAnswer[0], this.currentGame.answer1[0], this.currentGame.answer2[0], this.currentGame.answer3[0]];
      this.imageURL = this.currentGame.photoID;
      this.coloring = this.currentGame.coloring;

      //  lets the html know, that content can now be loaded

      this.initSounds();
      this.loadInnerTextValues();
      this.loaded = true;
    }
  }


  checkIfContentIsLoaded() {
    if( 
      // taken out atm to avoid long waiting between questions - has to be implementet better - will take alot of time
      // this.audioQuestionLoaded == true &&
      // this.audioButton1Loaded == true &&
      // this.audioButton2Loaded == true &&
      // this.audioButton3Loaded == true &&
      // this.audioButton4Loaded == true &&
      this.imageLoaded == true
      ) {
        this.loaded = true
      }
    else this.loaded = false;
  }

  // activated on click of left arrow - loades the previous game
  loadPreviousGame() {
    this.loaded = false;
    if(this.previousGames.length == 0) {
      this.noMoreGames = true;
      this.loaded = true;
      setTimeout(() => this.noMoreGames = false, 2500);
      return; //maybe add some feedback here
    } else {
        this.finalScreen = false;
        if(this.currentGame != undefined && this.default == false) this.Games.push(this.currentGame)
        else this.default = false;

        this.currentGame = this.previousGames.pop();
        this.question = this.currentGame.question[0];
        this.answers = [this.currentGame.rightAnswer[0], this.currentGame.answer1[0], this.currentGame.answer2[0], this.currentGame.answer3[0]];
        this.imageURL = this.currentGame.photoID; 
        this.coloring = this.currentGame.coloring;
        this.loaded = true;  
        this.initSounds();
        this.loadInnerTextValues();
      }
  }

    // makes changes persitant in the database
  saveChanges() { 
    //checks if changes have been made - if so, update the game
    if (this.checkForChanges()) {
      this.currentGame.rightAnswer[0] =  this.valueButton1;
      this.currentGame.answer1[0] =  this.valueButton2;
      this.currentGame.answer2[0] =  this.valueButton3;
      this.currentGame.answer3[0] = this.valueButton4;
      this.currentGame.question[0] = this.question;
      this.currentGame.rightAnswer[1] = this.audioURLAnswer1;
      this.currentGame.answer1[1] = this.audioURLAnswer2;
      this.currentGame.answer2[1] = this.audioURLAnswer3;
      this.currentGame.answer3[1] = this.audioURLAnswer4;
      this.currentGame.question[1] = this.audioURLQuestion;
      this.currentGame.coloring = this.coloring;        
      this.currentGame.photoID = this.imageURL;

      
      this.afs.updateTask(this.currentGame);
      this.finalScreen = false;
      this.saved = true;
      this.default = false;
      setTimeout(() => this.saved = false, 2500);
      
    }
    else {
      this.noChanges = true;
      setTimeout(() => this.noChanges = false, 2500);
    }
  }

  deletePictureOnAbort() {

  }

  noAudioSource() {
    //insert a warning that no audio can be found
  }

  
  

  // checks if the question, the image, or one of the button values has changed
  checkForChanges(): boolean{
    if(this.currentGame == undefined) return false;
    if(this.editingAudio == false) {
      this.valueButton1 = document.getElementById('button1').innerText;
      this.valueButton2 = document.getElementById('button2').innerText;
      this.valueButton3 = document.getElementById('button3').innerText;
      this.valueButton4 = document.getElementById('button4').innerText;
      this.question = document.getElementById('question').innerText;
    }
    if(this.currentGame.rightAnswer[0] == this.valueButton1 && 
       this.currentGame.answer1[0] == this.valueButton2 &&
       this.currentGame.answer2[0] == this.valueButton3 &&
       this.currentGame.answer3[0] == this.valueButton4 &&
       this.currentGame.question[0] == this.question &&
       this.currentGame.photoID == this.imageURL &&
       this.currentGame.rightAnswer[1] == this.audioURLAnswer1 &&
       this.currentGame.answer1[1] == this.audioURLAnswer2 &&
       this.currentGame.answer2[1] == this.audioURLAnswer3 &&
       this.currentGame.answer3[1] == this.audioURLAnswer4 &&
       this.currentGame.question[1] == this.audioURLQuestion &&
       this.currentGame.coloring == this.coloring) {
        return false;
       }
    else {
      return true;
    }
  }

  pictureEdited(imageURL?: string) {  
    if((<HTMLInputElement>document.getElementById('URL')) == null) return;
    if(imageURL != null) this.imageURL = imageURL
    else this.imageURL = (<HTMLInputElement>document.getElementById('URL')).value;
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
    }
    else {
      this.loaded=false;
      this.loadNextGame();
      if(this.editingAudio == true) {
        this.valueButton1 = this.currentGame.rightAnswer[0];
        this.valueButton2 = this.currentGame.answer1[0];
        this.valueButton3 = this.currentGame.answer2[0];
        this.valueButton4 = this.currentGame.answer3[0];
        this.question = this.currentGame.question[0];
      }
    }

  }

  //navigating to previous question
  leftArrowClicked() {
    if(this.checkForChanges()) {
      this.unsavedChanges = true;
    }
    else {
      this.loaded=false;
      this.loadPreviousGame();
      if(this.editingAudio == true) {
        this.valueButton1 = this.currentGame.rightAnswer[0];
        this.valueButton2 = this.currentGame.answer1[0];
        this.valueButton3 = this.currentGame.answer2[0];
        this.valueButton4 = this.currentGame.answer3[0];
        this.question = this.currentGame.question[0];
      }
    }
  }

  //save button from warning of unsaved changes
  saveAndContinue() {
    this.unsavedChanges=false;
    this.saveChanges();    
  }

  //discard button from warning of unsaved changes
  discardChanges() {
    this.unsavedChanges=false;
    // if (this.imageURL != this.currentGame.photoID) {
    //   if (this.imageURL.search("firebasestorage.googleapis.com") != -1) {
    //     this.afs.deleteFromStorageByUrl(this.imageURL);
    //   }
    // }
    this.loadInnerTextValues();
    this.initSounds();
  }

  //As content is mutable, this is necessary to avoid bugs
  loadInnerTextValues() {
    if(document.getElementById('button1') != null) {
      document.getElementById('button1').innerText = this.currentGame.rightAnswer[0];
      document.getElementById('button2').innerText = this.currentGame.answer1[0];
      document.getElementById('button3').innerText = this.currentGame.answer2[0];
      document.getElementById('button4').innerText = this.currentGame.answer3[0];
      document.getElementById('question').innerText = this.currentGame.question[0];
      this.imageURL = this.currentGame.photoID;
    }
  }

  switchMode() {
    if(this.editingAudio == false) {
      this.answers = [document.getElementById('button1').innerText, document.getElementById('button2').innerText, document.getElementById('button3').innerText, document.getElementById('button4').innerText];
      this.question = document.getElementById('question').innerText;
      this.valueButton1 = document.getElementById('button1').innerText;
      this.valueButton2 = document.getElementById('button2').innerText;
      this.valueButton3 = document.getElementById('button3').innerText;
      this.valueButton4 = document.getElementById('button4').innerText;
    }
    this.editingAudio = !this.editingAudio    
  }

  clearInnerText(idOfHTMLElement: string) {
    let elem = document.getElementById(idOfHTMLElement)
    if(
      elem.innerText == 'Falsche Antwort 1' ||
      elem.innerText == 'Falsche Antwort 2' ||
      elem.innerText == 'Falsche Antwort 3' ||
      elem.innerText == 'Richtige Antwort' ||
      elem.innerText == 'Hier die Frage eingeben'
    ) elem.innerText = ""
  }

  leftEditingMode(idOfHTMLElement: string) {
    let elem = document.getElementById(idOfHTMLElement)
    if(elem.innerText == ''){
      if(idOfHTMLElement == "question") elem.innerText = 'Hier die Frage eingeben';
      else if(idOfHTMLElement == "button1") elem.innerText = 'Richtige Antwort';
      else if(idOfHTMLElement == "button2") elem.innerText = 'Falsche Antwort 1';
      else if(idOfHTMLElement == "button3") elem.innerText = 'Falsche Antwort 2';
      else if(idOfHTMLElement == "button4") elem.innerText = 'Falsche Antwort 3';
    }

  }

  /**Deletes the currentGame from the Database
   * 
   */
 async deleteQuestion() {
  
    if (!this.finalScreen) {
      //get the UID from the CurrentElement if it is a valid Question
      let questionToDelete = this.currentGame.uid;
      //delete the question from the database
      this.loaded = false;
      this.deleteElementOverlay = false;
      await this.afs.deleteDocument("games", questionToDelete);
      this.loadNextGame(true);
    }

  }

  handleSelected($event) {
    if ($event.target.checked === true) {
      this.currentGame.coloring = true;
    }
    if ($event.target.checked === false) {
      this.currentGame.coloring = false;
    }
  }

  ngOnDestroy() {
    if (this.studentmodesubscription != undefined) this.studentmodesubscription.unsubscribe(); 
    this.audioURLSubscription.unsubscribe(); 
    this.imageURLSubscription.unsubscribe(); 
   }

}
