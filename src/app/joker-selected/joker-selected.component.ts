import { Component, OnInit } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-joker-selected',
  templateUrl: './joker-selected.component.html',
  styleUrls: ['./joker-selected.component.css'],
  animations: [
    trigger('popOverState', [
      state('show', style({
        opacity: 1
      })),
      state('hide', style({
        opacity: 0
      })),
      transition('show => hide', animate('3000ms ease-out')),
      transition('hide => show', animate('3000ms ease-in')),
    ])
  ]
})
export class JokerSelectedComponent implements OnInit {

  show = false;

  constructor() { }

  get stateName() {
    return this.show ? 'show' : 'hide';
  }

  toggle() {
    this.show = !this.show;
  }
  ngOnInit() {
  }
}
