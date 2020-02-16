import { Component, OnInit } from '@angular/core';

/**
 * Component which gets shown if no valid URI is inserted
 * 404 - Page not found error
 */

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
