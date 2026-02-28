import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Post as PostComponent } from './components/post/post';
import { inject, Injectable } from '@angular/core';

import { PostEntity } from './data/postEntity';
import { Postservice } from './components/postservice/postservice';
import { WorkitemService } from './services/workitem.service';
import { WorkItem } from './data/workitem';
import { WorkitemComponent } from './components/workitem/workitem.component/workitem.component';
import { WorkitemsComponent } from './components/workitems/workitems.component/workitems.component';

@Component({
  selector: 'app-root',
  //imports: [RouterOutlet,PostComponent],
  //imports: [RouterOutlet, PostComponent, WorkitemComponent, WorkitemsComponent],
  imports: [WorkitemsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('birdbook');
  protected readonly urlAuthValue = signal<string | null>(null);
  protected readonly urlTokenValue = signal<string | null>(null);

  data = signal<Array<PostEntity>>([]);
  sheetinfo = signal<any>(null);
  workitems = signal<Array<WorkItem>>([]);
  //private postService = inject(Postservice);
  private workitemService = inject(WorkitemService);
  async ngOnInit() {
    const authValue = new URLSearchParams(window.location.search).get('auth');
    const tokenValue = new URLSearchParams(window.location.search).get('token');
    this.urlAuthValue.set(authValue);
    this.urlTokenValue.set(tokenValue);
    if (authValue) {
      this.workitemService.setURLAuthValue(authValue);
    }
    if (tokenValue) {
      this.workitemService.setAuthToken(tokenValue);
    }
    console.log('Query param auth:', authValue);
    console.log('Query param token:', tokenValue);

    //const posts = await this.postService.searchPosts1();
    //const posts = await this.postService.readFromFile();
    //this.data.set(posts);
    //this.sheetinfo.set(sheetinfo1);
    //this.workitems.set(workitems);
    // this.postService.searchPosts().subscribe((posts) => {this.data.set(posts);}); 
  }
}
