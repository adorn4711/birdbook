import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkItem } from '../../../data/workitem';
import { Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-workitem',
  imports: [FormsModule],
  standalone: true,
  templateUrl: './workitem.component.html',
  styleUrl: './workitem.component.scss',
})
export class WorkitemComponent {

  @Input() id: string = '';
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() estimate: number = 0;
  @Input() verdict: 'yes' | 'no' | 'maybe' = 'maybe';
  @Input() estimateExplanation: string = '';
  @Output() estimateExplanationChange = new EventEmitter<string>();
  @Output() workitemChange = new EventEmitter<WorkItem>();
  @Input() subitems: WorkItem[] = [];
  @Output() changed = new EventEmitter<boolean>();

  get workitem(): WorkItem {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      estimate: this.estimate,
      verdict: this.verdict,
      estimateExplanation: this.estimateExplanation,
      subitems: this.subitems,
      changed: this.changed.observers.length > 0 // Mark as changed if there are observers for changes
    };
  }

  get getSubitems(): WorkItem[] {
    return this.workitem.subitems || [];
  }

  onEstimateExplanationChange(value: string): void {
    console.log('Estimate explanation changed for workitem:', this.id, 'New value:', value);
    this.changed.emit(true);
    this.estimateExplanation = value;
    this.estimateExplanationChange.emit(value);
    this.workitemChange.emit({
      ...this.workitem,
      estimateExplanation: value,
      changed: true,
    });
  }

  onSubitemWorkitemChange(updatedSubitem: WorkItem): void {
    this.subitems = this.subitems.map((item) =>
      item.id === updatedSubitem.id ? updatedSubitem : item
    );
    this.workitemChange.emit({
      ...this.workitem,
      subitems: this.subitems,
      changed: true,
    });
  }

}
