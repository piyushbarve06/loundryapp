import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddRatingPage } from './add-rating.page';

describe('AddRatingPage', () => {
  let component: AddRatingPage;
  let fixture: ComponentFixture<AddRatingPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddRatingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
