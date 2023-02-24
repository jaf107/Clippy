import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfLinkerTestComponent } from './pdf-linker-test.component';

describe('PdfLinkerTestComponent', () => {
  let component: PdfLinkerTestComponent;
  let fixture: ComponentFixture<PdfLinkerTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdfLinkerTestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfLinkerTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
