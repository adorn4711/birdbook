import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WorkItem } from '../data/workitem';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkitemService {
  private http = inject(HttpClient);
  private backendSheetInfoUrl = '/api/sheet';
  private backendWorkitemsUrl = '/api/workitems';
  private localWorkitemsUrl = '/assets/data/workitems.json';
  private localUrteilMitSchaetzungUrl = '/assets/data/urteil_etwas_ausfuehrlicher.workitems.json';
  private readonly isDev = (import.meta as any).env?.DEV ?? false;

  async getSheetInfo(): Promise<string> {
    const headers = { Accept: 'text/plain' } as const;
    if (this.isDev) {
      return 'dev';
    }
    try {
      const obs = this.http.get(this.backendSheetInfoUrl, { responseType: 'text' });
      const text = await firstValueFrom(obs);
      return text;
    } catch {
      // Fallback value in dev when backend is unavailable
      return 'dev';
    }
  }

  async getWorkitems(): Promise<Array<WorkItem>> {
    if (this.isDev) {
      const obs = this.http.get<Array<WorkItem>>(this.localUrteilMitSchaetzungUrl);
      //const obs = this.http.get<Array<WorkItem>>(this.localWorkitemsUrl);
      const workitems = await firstValueFrom(obs);
      return workitems;
    }
    try {
      const obs = this.http.get<Array<WorkItem>>(this.backendWorkitemsUrl);
      const workitems = await firstValueFrom(obs);
      return workitems;
    } catch {
      // Fallback to local static data in dev
      const obs = this.http.get<Array<WorkItem>>(this.localWorkitemsUrl);
      const workitems = await firstValueFrom(obs);
      return workitems;
    }
  }

  async getWorkItemTest(): Promise<string> {
    const headers = { Accept: 'text/plain' } as const;
    const obs = this.http.get(this.backendSheetInfoUrl, { responseType: 'text' });
    const text = await firstValueFrom(obs);
    return text;
  }
}
