import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { suspensionGuard } from './suspension.guard';

describe('suspensionGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => suspensionGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
