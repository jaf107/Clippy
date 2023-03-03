import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SidebarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`shoulde have isActive to be True`, () => {
    expect(component.isActive).toBeTruthy();
  });
  it(`should have optionValue to be False `, () => {
    expect(component.optionsActive).toBeFalsy();
  });
  it('should have extractive false by default', () => {
    expect(component.extractiveOn).toBeFalsy();
  });

  it('should have abstractive false by default', () => {
    expect(component.abstractiveOn).toBeFalsy();
  });

  it('should have citationGraph false by default', () => {
    expect(component.knowledgeGraphOn).toBeFalsy();
  });

  it(`should toggle showOptions on`, () => {
    expect(component.optionsActive).toBeFalsy();
    component.showOptions();
    expect(component.optionsActive).toBeTruthy();
  });

  it(`should toggle showOptions on & off`, () => {
    expect(component.optionsActive).toBeFalsy();
    component.showOptions();
    expect(component.optionsActive).toBeTruthy();
    component.showOptions();
    expect(component.optionsActive).toBeFalsy();
  });

  it(`should toggle isActive on`, () => {
    expect(component.isActive).toBeFalsy();
    component.showOptions();
    expect(component.isActive).toBeTruthy();
  });

  it(`should toggle isActive off`, () => {
    expect(component.isActive).toBeFalsy();
    component.showOptions();
    expect(component.isActive).toBeTruthy();
    component.showOptions();
    expect(component.isActive).toBeFalsy();
  });
});
