import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkitemComponent } from './workitem.component';

describe('WorkitemComponent', () => {
  let component: WorkitemComponent;
  let fixture: ComponentFixture<WorkitemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkitemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkitemComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
