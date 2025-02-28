/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Washing Wala Full App Ionic 6 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportsComponent } from './supports.component';

describe('SupportsComponent', () => {
  let component: SupportsComponent;
  let fixture: ComponentFixture<SupportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SupportsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SupportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
