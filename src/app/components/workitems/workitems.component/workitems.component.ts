import { Component, signal } from '@angular/core';
import { inject, Injectable } from '@angular/core';
import { WorkitemComponent } from '../../workitem/workitem.component/workitem.component';
import { WorkItem } from '../../../data/workitem';
import { WorkitemService } from '../../../services/workitem.service';

@Component({
  selector: 'app-workitems',
  imports: [WorkitemComponent],
  standalone: true,
  templateUrl: './workitems.component.html',
  styleUrl: './workitems.component.scss',
})
export class WorkitemsComponent {
    private workitemService = inject(WorkitemService);
    workitems = signal<Array<WorkItem>>([]);

    async ngOnInit() {
        const workitems =  await this.workitemService.getWorkitems();
        this.workitems.set(workitems);
    }


}
