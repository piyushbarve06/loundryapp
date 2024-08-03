import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComplaintsPage } from './complaints.page';

describe('ComplaintsPage', () => {
  let component: ComplaintsPage;
  let fixture: ComponentFixture<ComplaintsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ComplaintsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
