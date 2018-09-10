import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DataSharingService {

  private conctactGroupSource = new BehaviorSubject([]);

  currentConctactGroup = this.conctactGroupSource.asObservable();

  changeConctactGroup(groupObj) {
    this.conctactGroupSource.next(groupObj);
  }
  
  /* private conctactSource = new BehaviorSubject({});
  
  currentConctact = this.conctactSource.asObservable();
  changeContact(contactObj) {
    this.conctactSource.next(contactObj);
  } */

}
