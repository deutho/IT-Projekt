import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalFormsGameComponent } from './personal-forms-game.component';

describe('PersonalFormsGameComponent', () => {
  let component: PersonalFormsGameComponent;
  let fixture: ComponentFixture<PersonalFormsGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonalFormsGameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalFormsGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
