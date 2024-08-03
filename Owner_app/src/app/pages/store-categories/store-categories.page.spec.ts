import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreCategoriesPage } from './store-categories.page';

describe('StoreCategoriesPage', () => {
  let component: StoreCategoriesPage;
  let fixture: ComponentFixture<StoreCategoriesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(StoreCategoriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
