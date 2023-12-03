import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemstoreComponent } from './itemstore.component';

describe('ItemstoreComponent', () => {
  let component: ItemstoreComponent;
  let fixture: ComponentFixture<ItemstoreComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ItemstoreComponent]
    });
    fixture = TestBed.createComponent(ItemstoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
