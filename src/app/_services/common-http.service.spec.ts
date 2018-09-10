import { TestBed, inject } from '@angular/core/testing';

import { CommonHttpService } from './common-http.service';

describe('CommonHttpService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommonHttpService]
    });
  });

  it('should be created', inject([CommonHttpService], (service: CommonHttpService) => {
    expect(service).toBeTruthy();
  }));
});
