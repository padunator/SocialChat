import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JokerSelectedComponent } from './joker-selected.component';

describe('JokerSelectedComponent', () => {
  let component: JokerSelectedComponent;
  let fixture: ComponentFixture<JokerSelectedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JokerSelectedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JokerSelectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
