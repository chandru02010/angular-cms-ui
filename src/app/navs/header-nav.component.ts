import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { User } from '../_models';
import { UserService } from '../_services';

@Component({
  selector: 'app-header-nav',
  templateUrl: './header-nav.component.html',
  styleUrls: ['./header-nav.component.css']
})
export class HeaderNavComponent implements OnInit {
  currentUser: User;
  users: User[] = [];
  constructor(private userService: UserService) { 
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit() {
    // Load all Users
    this.loadAllUsers();
  }
  // Load all users
  loadAllUsers() {
    this.userService.getAll().pipe(first()).subscribe(users => { 
        this.users = users;
    });
  }
  
  // Delete User
  deleteUser(id: number) {
    this.userService.delete(id).pipe(first()).subscribe(() => { 
        this.loadAllUsers() 
    });
  }

}
