import { Component, OnInit, isDevMode } from '@angular/core';
import { environment } from '../environment/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'frontend';
  ngOnInit() {
    if (isDevMode()) {
      // console.log('Development!');
    } else {
      // console.log('Production!');
    }
  }
}