import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuildsearchComponent } from './guildsearch.component';

describe('GuildsearchComponent', () => {
  let component: GuildsearchComponent;
  let fixture: ComponentFixture<GuildsearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GuildsearchComponent]
    });
    fixture = TestBed.createComponent(GuildsearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
