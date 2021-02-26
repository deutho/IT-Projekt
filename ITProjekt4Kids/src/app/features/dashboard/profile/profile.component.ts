import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { User } from 'src/app/models/users.model';
import { AppService } from 'src/app/services/app.service';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreDataService } from 'src/app/services/firestore-data.service';
import { flattenDiagnosticMessageText } from 'typescript';
import {MainComponent} from '../main/main.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  

  currentUser: User;
  accountTyp: String;
  imageURL = "";
  editingPicture: boolean = false;
  loaded: boolean = false;
  
  
  constructor(public afs: FirestoreDataService, private app: AppService, public router: Router) {
    this.app.myImageURL$.subscribe((data) => {
      this.imageURL = data;
      // console.log(data)
      this.pictureEdited(data)
    });
  }
  
  async ngOnInit() {
  
    await this.afs.getCurrentUser().then(data => this.currentUser = data[0]);
    this.currentUser.username = this.currentUser.username.substring(0, this.currentUser.username.lastIndexOf('@'));

    if(this.currentUser.role == 1) this.accountTyp = "Adminaccount";
    else if(this.currentUser.role == 2) this.accountTyp = "Lehreraccount";
    else if (this.currentUser.role == 3) this.accountTyp = "Schüler";

    this.app.myHeader("Profil");
    this.imageURL = this.currentUser.photoID;
    this.loaded = true;

  }

  pictureEdited(imageURL?: string) {  
    if((<HTMLInputElement>document.getElementById('URL')) == null) return;
    if(imageURL != null) this.imageURL = imageURL
    else this.imageURL = (<HTMLInputElement>document.getElementById('URL')).value;
    this.afs.updateUserPicture(this.imageURL, this.currentUser.uid)
    console.log(this.imageURL)
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
    this.imageURL = this.currentUser.photoID;
  }


}
