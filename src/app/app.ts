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
  imports: [RouterOutlet,PostComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('birdbook');

  data:Array<Post> = [];

  async ngOnInit() {
    const response = await fetch('./assets/data/posts.json');
    this.data = await response.json();
    console.log(this.data); 
  }
}
