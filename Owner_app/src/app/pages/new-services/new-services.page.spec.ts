import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewServicesPage } from './new-services.page';

describe('NewServicesPage', () => {
  let component: NewServicesPage;
  let fixture: ComponentFixture<NewServicesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(NewServicesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
