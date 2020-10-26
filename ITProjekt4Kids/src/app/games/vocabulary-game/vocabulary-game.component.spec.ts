import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VocabularyGameComponent } from './vocabulary-game.component';

describe('VocabularyGameComponent', () => {
  let component: VocabularyGameComponent;
  let fixture: ComponentFixture<VocabularyGameComponent>;

  beforeEach(async () => { 
    await TestBed.configureTestingModule({
      declarations: [ VocabularyGameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VocabularyGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
