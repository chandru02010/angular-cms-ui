import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  itemValue = new Subject();

  set usersData(value) {
    this.itemValue.next(value); // this will make sure to tell every subscriber about the change.
    localStorage.setItem('usersData', value);
  }

  get usersData() {
    return localStorage.getItem('usersData');
  }
}
