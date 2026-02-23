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
    await this.workitemService.getSecurityToken();
    const workitems = await this.workitemService.getWorkitems();
    const sorted = this.sortWorkitems(workitems);
    this.workitems.set(sorted);
  }

  private sortWorkitems(items: WorkItem[]): WorkItem[] {
    return items.sort((a, b) => a.title.localeCompare(b.title)).map(item => ({
      ...item,
      subitems: item.subitems ? item.subitems.sort((a, b) => a.title.localeCompare(b.title)) : item.subitems
    }));
  }

  saveEstimateExplanation(workitem: WorkItem): void {
    console.log('Saving estimateExplanation:', workitem.title, workitem.estimateExplanation);
    this.workitemService.update(workitem);
  }

  onWorkitemChange(updated: WorkItem): void {
    this.workitems.update((items) =>
      items.map((item) => (item.id === updated.id ? updated : item))
    );
  }

  async saveAll(): Promise<void> {
    this.workitemService.save(this.workitems());
  }

  async resetLocalCache(): Promise<void> {
    const confirmed = window.confirm('Reset local cache and reload original workitems?');
    if (!confirmed) {
      return;
    }
    this.workitemService.clearLocalCache();
    const workitems = await this.workitemService.getWorkitems();
    this.workitems.set(workitems);
  }


}
