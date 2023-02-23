import { TestBed } from '@angular/core/testing';

import { PdfShareService } from './pdf-share.service';

describe('PdfShareService', () => {
  let service: PdfShareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfShareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
