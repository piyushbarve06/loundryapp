import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddStripeCardPage } from './add-stripe-card.page';

describe('AddStripeCardPage', () => {
  let component: AddStripeCardPage;
  let fixture: ComponentFixture<AddStripeCardPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddStripeCardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
