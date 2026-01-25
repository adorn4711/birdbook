import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PostEntity } from '../../data/postEntity';
import { Observable, firstValueFrom } from 'rxjs';

// Sheets integration migrated from main1.ts as a service method
interface GoogleServiceAccountCreds {
  client_email: string;
  private_key: string;
}

interface SheetInfo {
  title: string;
  sheetTitle: string;
  rowCount: number;
}


@Injectable({
  providedIn: 'root',
})
export class Postservice {

  private http = inject(HttpClient);
  private localAssetsUrl = '/assets/data/posts.json';
  private readonly isDev = (import.meta as any).env?.DEV ?? false;
  // Optionally keep external URLs for future use
  // private flightUrl = 'https://demo.angulararchitects.io/api/flight';
  // private googlesheet='https://docs.google.com/spreadsheets/d/1QpNG99Pnm_Sfz2Wle1deEnkne5Wi-49sUTy_Xu_xXqI/edit?gid=0#gid=0';
  private backendSheetInfoUrl = '/api/sheet';
  constructor() {}

  
  async readFromFile():Promise<PostEntity[]>{
        const response = await fetch('./assets/data/posts.json');
    const posts = await response.json();
    return posts;
  }

  

  async getPosts(): Promise<Observable<PostEntity[]>> {
    const headers = { 'Accept': 'application/json' };
    const response = this.http.get<Array<PostEntity>>(this.localAssetsUrl, { headers });
    return response;
  }

  //async getFlights():any[] {
  //  const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
  //  const response = await this.http.get<Array<any>>(this.flightUrl, { headers: headers });
  //  console.log(response);
  //  return response;
  //}


  // Load posts from local assets; in dev/test this avoids network issues
  async searchPosts1(): Promise<PostEntity[]> {
    try {
      const obs = this.http.get<PostEntity[]>(this.localAssetsUrl);
      const data = await firstValueFrom(obs);
      return data;
    } catch {
      return [];
    }
  }

  // Observable variant using HttpClient
  searchPosts(): Observable<PostEntity[]> {
    return this.http.get<PostEntity[]>(this.localAssetsUrl);
  }
  //
  //{"id":"1QpNG99Pnm_Sfz2Wle1deEnkne5Wi-49sUTy_Xu_xXqI","title":"angulartest","sheets":[{"index":0,"id":0,"title":"TabBlat1","rowCount":1000}]}
  // Calls backend GET endpoint and returns text response as string
  getSheetInfo$(): Observable<string> {
    return this.http.get(this.backendSheetInfoUrl, { responseType: 'text' });
  }

  async getSheetInfo(): Promise<string> {
    const headers = { Accept: 'text/plain' } as const;
    const obs = this.http.get(this.backendSheetInfoUrl, { responseType: 'text' });
    const text = await firstValueFrom(obs);
    return text;
  }


}
