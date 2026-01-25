import { Component } from '@angular/core';
import { WorkItem } from '../../../data/workitem';
import { Input } from '@angular/core';

@Component({
  selector: 'app-workitem',
  imports: [],
  standalone: true,
  templateUrl: './workitem.component.html',
  styleUrl: './workitem.component.scss',
})
export class WorkitemComponent {

  @Input() title: string = '';
  @Input() description: string = '';
  @Input() estimate: number = 0;
  @Input() verdict: 'yes' | 'no' | 'maybe' = 'maybe';
  @Input() subitems: WorkItem[] = [];

  get workitem(): WorkItem {
    return {
      id: '1',
      title: this.title,
      description: this.description,
      estimate: this.estimate,
      verdict: this.verdict,
    };
  }

  get getSubitems(): WorkItem[] {
    return this.workitem.subitems || [];
  }

}
