import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-post',
  imports: [],
  templateUrl: './post.html',
  styleUrl: './post.scss',
})
export class Post {

  @Input() image: string = '1';
  @Input() name: string = 'Test';
  @Input() time: string = '5min ago';
  @Input() text: string = 'Sample post text';

}

/*
    <img class="profile-image" [src]="'./assets/imgs/img' + img + '.jpeg'" alt="Image 1">
*/