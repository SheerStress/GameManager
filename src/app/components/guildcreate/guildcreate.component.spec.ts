import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuildcreateComponent } from './guildcreate.component';

describe('GuildcreateComponent', () => {
  let component: GuildcreateComponent;
  let fixture: ComponentFixture<GuildcreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GuildcreateComponent]
    });
    fixture = TestBed.createComponent(GuildcreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
