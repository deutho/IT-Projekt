import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbPositionGameComponent } from './verb-position-game.component';

describe('VerbPositionGameComponent', () => {
  let component: VerbPositionGameComponent;
  let fixture: ComponentFixture<VerbPositionGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerbPositionGameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerbPositionGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
