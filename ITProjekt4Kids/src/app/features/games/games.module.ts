import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VocabularyGameComponent } from '../games/vocabulary-game/vocabulary-game.component';
import { VocabularyGameEditComponent } from './vocabulary-game-edit/vocabulary-game-edit.component';



@NgModule({
  declarations: [VocabularyGameComponent, VocabularyGameEditComponent],
  imports: [
    CommonModule
  ]
})
export class GamesModule { }
