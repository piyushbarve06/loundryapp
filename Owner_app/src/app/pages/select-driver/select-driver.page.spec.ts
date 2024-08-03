import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectDriverPage } from './select-driver.page';

describe('SelectDriverPage', () => {
  let component: SelectDriverPage;
  let fixture: ComponentFixture<SelectDriverPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SelectDriverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
