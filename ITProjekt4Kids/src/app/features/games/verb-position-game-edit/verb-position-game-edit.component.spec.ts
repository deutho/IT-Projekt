import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbPositionGameEditComponent } from './verb-position-game-edit.component';

describe('VerbPositionGameEditComponent', () => {
  let component: VerbPositionGameEditComponent;
  let fixture: ComponentFixture<VerbPositionGameEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerbPositionGameEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbPositionGameEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
