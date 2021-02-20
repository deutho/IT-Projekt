import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameRedirectComponent } from './game-redirect.component';

describe('GameRedirectComponent', () => {
  let component: GameRedirectComponent;
  let fixture: ComponentFixture<GameRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameRedirectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
