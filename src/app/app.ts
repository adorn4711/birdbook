import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Post as PostComponent } from './components/post/post';

interface Post {
  image: string;
  name: string;
  time: string;
  text: string;
}

@Component({
  selector: 'app-root',
  //imports: [RouterOutlet,PostComponent],
  imports: [PostComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('birdbook');

  data = signal<Array<Post>>([]);

  async ngOnInit() {
    const response = await fetch('./assets/data/posts.json');
    const posts = await response.json();
    this.data.set(posts);
  }
}
