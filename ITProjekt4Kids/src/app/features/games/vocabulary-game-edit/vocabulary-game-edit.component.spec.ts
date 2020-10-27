import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VocabularyGameEditComponent } from './vocabulary-game-edit.component';

describe('VocabularyGameEditComponent', () => {
  let component: VocabularyGameEditComponent;
  let fixture: ComponentFixture<VocabularyGameEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VocabularyGameEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VocabularyGameEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
