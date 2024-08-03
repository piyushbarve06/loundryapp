import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RedeemSuccessPage } from './redeem-success.page';

describe('RedeemSuccessPage', () => {
  let component: RedeemSuccessPage;
  let fixture: ComponentFixture<RedeemSuccessPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RedeemSuccessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
