import { TestBed } from '@angular/core/testing';

import { WorkitemService } from './workitem.service';

describe('WorkitemService', () => {
  let service: WorkitemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkitemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
