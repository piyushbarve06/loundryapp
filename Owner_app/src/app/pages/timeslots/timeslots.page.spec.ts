import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeslotsPage } from './timeslots.page';

describe('TimeslotsPage', () => {
  let component: TimeslotsPage;
  let fixture: ComponentFixture<TimeslotsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TimeslotsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
