import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StripePayPage } from './stripe-pay.page';

describe('StripePayPage', () => {
  let component: StripePayPage;
  let fixture: ComponentFixture<StripePayPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(StripePayPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
