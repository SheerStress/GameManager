import { TestBed } from '@angular/core/testing';

import { GuildDataService } from './guild-data.service';

describe('GuildDataService', () => {
  let service: GuildServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuildDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
