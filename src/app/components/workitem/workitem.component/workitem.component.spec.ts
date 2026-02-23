import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkitemComponent } from './workitem.component';
import { WorkItem } from '../../../data/workitem';

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

  it('emits workitemChange when estimate explanation changes', () => {
    const workitemChangeSpy = spyOn(component.workitemChange, 'emit');

    component.id = '1';
    component.title = 'Item 1';
    component.description = 'Desc';
    component.estimate = 3;
    component.verdict = 'yes';

    component.onEstimateExplanationChange('New explanation');

    expect(workitemChangeSpy).toHaveBeenCalledWith({
      id: '1',
      title: 'Item 1',
      description: 'Desc',
      estimate: 3,
      verdict: 'yes',
      estimateExplanation: 'New explanation',
      subitems: [],
      changed: true,
    } as WorkItem);
  });

  it('emits workitemChange when a subitem updates', () => {
    const workitemChangeSpy = spyOn(component.workitemChange, 'emit');
    const originalSubitem: WorkItem = {
      id: 'sub-1',
      title: 'Sub 1',
      description: 'Sub desc',
      estimate: 1,
      verdict: 'maybe',
      estimateExplanation: 'Old',
      subitems: [],
    };
    const updatedSubitem: WorkItem = {
      ...originalSubitem,
      estimateExplanation: 'Updated',
    };

    component.id = '1';
    component.title = 'Item 1';
    component.description = 'Desc';
    component.estimate = 3;
    component.verdict = 'yes';
    component.subitems = [originalSubitem];

    component.onSubitemWorkitemChange(updatedSubitem);

    expect(component.subitems[0].estimateExplanation).toBe('Updated');
    expect(workitemChangeSpy).toHaveBeenCalledWith({
      id: '1',
      title: 'Item 1',
      description: 'Desc',
      estimate: 3,
      verdict: 'yes',
      estimateExplanation: '',
      subitems: [updatedSubitem],
      changed: true,
    } as WorkItem);
  });
});
