import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginModule } from './features/login.module';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestore, AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
import * as firebase from 'firebase';
import {FeaturesModule} from '../app/features/features.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {HttpClientModule} from '@angular/common/http';
import {AngularFireStorageModule} from '@angular/fire/storage'
firebase.initializeApp(environment.firebase)
import { CommonModule } from '@angular/common';  
import { RecordRTCService } from './services/record-rtc.service';
import { VerbPositionGameComponent } from './features/games/verb-position-game/verb-position-game.component';
import { VerbPositionGameEditComponent } from './features/games/verb-position-game-edit/verb-position-game-edit.component';

@NgModule({
  declarations: [
    AppComponent,
    VerbPositionGameComponent,
    VerbPositionGameEditComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, 
    LoginModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AngularFireStorageModule,
    CommonModule
  ],
  providers: [ 
    AngularFirestore,
    RecordRTCService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
