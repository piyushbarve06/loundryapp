import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddTimeslotsPage } from './add-timeslots.page';

describe('AddTimeslotsPage', () => {
  let component: AddTimeslotsPage;
  let fixture: ComponentFixture<AddTimeslotsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddTimeslotsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
