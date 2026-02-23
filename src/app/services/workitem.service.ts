import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { WorkItem } from '../data/workitem';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkitemService {
  private http = inject(HttpClient);
  private backendSheetInfoUrl = '/api/sheet';
  private backendWorkitemsUrl = '/api/workitems';
  private backendLoginUrl = '/api/testaccess';
  private backendWorkitemsSaveUrl = '/api/workitems/save';
  private localWorkitemsUrl = 'test/assets/data/workitems.json';
  private localUrteilMitSchaetzungUrl = 'test/assets/data/urteil_etwas_ausfuehrlicher.workitems.json';
  private readonly isDev = (import.meta as any).env?.DEV ?? false;
  private readonly localStorageKey = 'birdbook.workitems';
  private readonly authTokenStorageKey = 'birdbook.authToken';
  private lastLoadedFrom: 'backend' | 'local' | 'none' = 'none';
  workitems: Array<WorkItem> = [];

  async getSecurityToken(): Promise<string | null> {
    const headers = { Accept: 'text/plain' } as const;
    try {
      const obs = this.http.get(this.backendLoginUrl, {
        responseType: 'text',
        headers: headers,
      });
      const text = await firstValueFrom(obs);
      const accessToken = this.extractAccessToken(text);
      if (!accessToken) {
        console.warn('No access token received from backend login endpoint.');
        return null;
      }
      this.setAuthToken(accessToken);
      return accessToken;
    } catch (err) {
      console.error('Failed to get security token from backend.', err);
      return null;
    }
  }

  private extractAccessToken(payload: string): string | null {
    if (!payload) {
      return null;
    }

    if (this.looksLikeVercelAuthPage(payload)) {
      console.warn('Vercel Authentication protection is active for backend routes.');
      return null;
    }

    try {
      const parsed = JSON.parse(payload) as { accessToken?: string };
      return parsed.accessToken ?? null;
    } catch {
      return null;
    }
  }

  private looksLikeVercelAuthPage(payload: string): boolean {
    const lower = payload.toLowerCase();
    return lower.includes('authentication required') && lower.includes('vercel');
  }

  private async ensureAuthToken(): Promise<string | null> {
    const token = this.getAuthToken();
    if (token) {
      return token;
    }
    return this.getSecurityToken();
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    if (!token) {
      return {};
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  setAuthToken(token: string): void {
    console.log('Setting auth token:', token);
    localStorage.setItem(this.authTokenStorageKey, token);
  }

  clearAuthToken(): void {
    localStorage.removeItem(this.authTokenStorageKey);
  }

  getAuthToken(): string | null {
    return localStorage.getItem(this.authTokenStorageKey);
  }

  async getSheetInfo(): Promise<string> {
    const headers = { Accept: 'text/plain' } as const;
    if (this.isDev) {
      return 'dev';
    }
    try {
      const obs = this.http.get(this.backendSheetInfoUrl, {
        responseType: 'text',
        //headers: this.getAuthHeaders(),
      });
      const text = await firstValueFrom(obs);
      return text;
    } catch {
      // Fallback value in dev when backend is unavailable
      return 'dev';
    }
  }
  private async readFromLocalFile(fileURL: string): Promise<Array<WorkItem>> {
    try {
      const obs = this.http.get<Array<WorkItem>>(fileURL);
      const workitems = await firstValueFrom(obs);
      this.workitems.forEach((item) => (item.changed = false));
      return workitems;
    } catch {
      console.error('Failed to load local workitems from file:', fileURL, 'Returning empty list.');
      return [];
    }
  }

  private async readFromBackend(): Promise<Array<WorkItem>> {
    await this.ensureAuthToken();
    try {
      console.log('Attempting to load workitems from backend at:', this.backendWorkitemsUrl);
      const obs = this.http.get<Array<WorkItem>>(this.backendWorkitemsUrl, {
        headers: this.getAuthHeaders(),
      });
      const workitems = await firstValueFrom(obs);
      this.workitems.forEach((item) => (item.changed = false));
      return workitems;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.clearAuthToken();
        await this.ensureAuthToken();
        const retry = this.http.get<Array<WorkItem>>(this.backendWorkitemsUrl, {
          headers: this.getAuthHeaders(),
        });
        return await firstValueFrom(retry);
      }
      throw error;
    }
  }



  async getWorkitems(): Promise<Array<WorkItem>> {
    console.log("Env:'", (import.meta as any).env, "'");
    const cached = this.readLocalCache();
    if (cached) {
      this.workitems = cached;
      this.workitems.forEach((item) => (item.changed = false));
      this.lastLoadedFrom = 'backend';
      return cached;
    }

    try {
      this.workitems = await this.readFromBackend();
      this.lastLoadedFrom = 'backend';
      return this.workitems;
    } catch (error) {
      console.error('Failed to load workitems from backend. Falling back to local file.', error);
      console.error('Failed to load workitems from backend. Backend may be unavailable. Falling back to local file.');
      this.workitems = await this.readFromLocalFile(this.localUrteilMitSchaetzungUrl);
      this.lastLoadedFrom = 'local';
      return this.workitems;
    }
  }

  async getWorkItemTest(): Promise<string> {
    const headers = { Accept: 'text/plain' } as const;
    const obs = this.http.get(this.backendSheetInfoUrl, {
      responseType: 'text',
      headers: this.getAuthHeaders(),
    });
    const text = await firstValueFrom(obs);
    return text;
  }

  update(workitem: WorkItem): void {
    console.log('Updating workitem:', workitem.id);
    const index = this.workitems.findIndex((item) => item.id === workitem.id);
    if (index === -1) {
      this.workitems = [...this.workitems, workitem];
      void this.persistIfLocal();
      return;
    }
    this.workitems = this.workitems.map((item, idx) => (idx === index ? workitem : item));
    void this.persistIfLocal();
  }
  save(workItems: WorkItem[]): void {
    console.log('Saving workitems. Last loaded from:', this.lastLoadedFrom);
    this.workitems = workItems;
    console.log('Current workitems:', this.workitems);
    for (const item of this.workitems) {
      if (item.changed) {
        console.log('Workitem:', item.id, 'Changed:', item.changed);
        this.saveToBackend(item);
      }
      if (item.subitems && item.subitems.length > 0) {
        for (const subitem of item.subitems) {
          if (subitem.changed) {
            console.log('Subitem:', subitem.id, 'Changed:', subitem.changed);
            this.saveToBackend(subitem);
          }
        }
      }
      if (item.title.startsWith('b)')) {
        console.log('Workitem with title "b)" found:', item);
      }
    }

    //if (this.lastLoadedFrom !== 'backend') {
    //  alert('Cannot save to backend because data was loaded from local cache. Please reset local cache first.');
    //  return;
    //}
    //this.persistIfLocal();
  }

  private async saveToBackend(workitem: WorkItem): Promise<void> {
    try {
      const obs = this.http.post<any>(this.backendWorkitemsSaveUrl, workitem, {
        headers: this.getAuthHeaders(),
      });
      await firstValueFrom(obs);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.clearAuthToken();
        await this.ensureAuthToken();
        const retry = this.http.post<any>(this.backendWorkitemsSaveUrl, workitem, {
          headers: this.getAuthHeaders(),
        });
        await firstValueFrom(retry);
        return;
      }
      // Keep local cache when backend save is unavailable.
    }
  }

  private async persistIfLocal(): Promise<void> {
    this.writeLocalCache(this.workitems);
    if (this.lastLoadedFrom !== 'local') {
      try {
        confirm('Persist changes to backend? This will only work if data was loaded from backend and backend is available. Otherwise, changes will be saved to local cache only.');
        const obs = this.http.post<any>(this.backendWorkitemsSaveUrl, this.workitems, {
          headers: this.getAuthHeaders(),
        });
        await firstValueFrom(obs);
      } catch {
        // Keep local cache when backend save is unavailable.
      }
    }
  }

  private readLocalCache(): Array<WorkItem> | null {
    const raw = localStorage.getItem(this.localStorageKey);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as Array<WorkItem>;
    } catch {
      return null;
    }
  }

  private writeLocalCache(workitems: Array<WorkItem>): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(workitems));
  }

  clearLocalCache(): void {
    localStorage.removeItem(this.localStorageKey);
    this.lastLoadedFrom = 'none';
  }


}
