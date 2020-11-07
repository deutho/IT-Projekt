import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalFormsGameEditComponent } from './personal-forms-game-edit.component';

describe('PersonalFormsGameEditComponent', () => {
  let component: PersonalFormsGameEditComponent;
  let fixture: ComponentFixture<PersonalFormsGameEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonalFormsGameEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalFormsGameEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
