import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkitemsComponent } from './workitems.component';

describe('WorkitemsComponent', () => {
  let component: WorkitemsComponent;
  let fixture: ComponentFixture<WorkitemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkitemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkitemsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
