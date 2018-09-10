import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { DataTableDirective } from 'angular-datatables';
import { DataSharingService } from '../_services/data-sharing.service';

import { User } from '../_models';
import { UserService } from '../_services';
import { Subject } from 'rxjs';

declare var jQuery: any;

@Component({
  templateUrl: 'home.component.html'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private onDestroy$ = new Subject<void>();
  submitted = false;
  createContactGroupForm: FormGroup;
  modifyContactGroupForm: FormGroup;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChild('tableDiv')
  tableDiv: ElementRef;
  @ViewChild('tableWrapper')
  tableWrapper: ElementRef;
  currentUser: User;
  users: User[] = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  tableData = [];
  pageLoading: boolean;
  tableView: boolean;
  dataLoadingError: boolean;
  docsListUrl: string;
  usersData = [];
  groupsData = [];
  currentUserData = [];
  contactGroupObj: any;
  selectedGroup: any;
  createContactGroupObj = {};
  createFirstContactGroup: boolean;
  pipe = new DatePipe('en-US');
  currentDate: string;
  groupStatus: string;

  errorMessage = 'This is required';
  groupNamePlaceholder = 'Please enter group name';

  constructor(
    private router: Router,
    private aRoute: ActivatedRoute,
    private userService: UserService,
    private dataSharing: DataSharingService,
    private formBuilder: FormBuilder
  ) {
    this.pageLoading = true;
    this.tableView = true;
    this.dataLoadingError = false;
    this.createFirstContactGroup = false;
    
    this.currentDate = this.pipe.transform(Date.now(), 'dd/MM/yyyy');
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.usersData = JSON.parse(localStorage.getItem('usersData'));

  }

  ngOnInit() {
    // === Setting Table Options
    this.dtOptions = {
      paging: true,
      searching: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      lengthMenu: [5, 10, 25, 50, 100],
      responsive: true,
      language: {
        search: 'Search records here: '
      }
    };
    // === Load all Users
    this.loadAllUsers();

    if (this.usersData) {

      // === Current user filtering
      this.currentUserData = this.usersData.filter(user => {
        return user.user === this.currentUser.username;
      });

      if (this.currentUserData[0].groupsData.length == 0) {
        console.log('zero');
        this.tableView = true;
        this.createFirstContactGroup = true;
      } else {
        console.log('more than zero');
        this.createFirstContactGroup = false;
        this.tableView = true;
      }
      // this.usersData[0].contactGroupObj.
    } else {
      console.log('no usersobj');
      this.usersData = [
        {
          "user": this.currentUser.username,
          "groupsData": []
        }
      ];
      this.currentUserData = this.usersData;
      this.createFirstContactGroup = true;
      // JSON.stringify(localStorage.setItem("usersData", this.usersData));
      this.dataSharing.changeConctactGroup(this.usersData);
      // this.globalService.usersData = JSON.stringify(this.usersData);
    }
    
    // localStorage.setItem("usersData", JSON.stringify(this.usersData));


    this.groupsData = this.currentUserData[0].groupsData;

    this.createContactGroupForm = this.formBuilder.group({
      groupName: ['', Validators.required]
    });
    this.modifyContactGroupForm = this.formBuilder.group({
      groupName: ['', Validators.required],
      status: ['']
    });
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
    this.pageLoading = false;
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  // === Setting form controls to "f"
  get f() {
    return this.createContactGroupForm.controls;
  }

  // === Setting form controls to "m"
  get m() {
    return this.modifyContactGroupForm.controls;
  }

  updateStatus(value) {
    this.modifyContactGroupForm.controls.status.setValue(value.target.value);
  }
  // === Form submit
  formSubmit(event, formObj) {
    console.log(event);

    console.log('on submit obj', formObj);
    this.submitted = true;

    // === Modify row
    if (formObj) {
      if (this.modifyContactGroupForm.invalid) {
        return;
      }

      for (const group of this.groupsData) {
        if (formObj.name === group.name) {
          this.groupsData.splice(this.groupsData.indexOf(group), 1);
          break;
        }
      }
      this.createContactGroupObj = {
        name: this.modifyContactGroupForm.controls.groupName.value,
        createdDate: this.currentDate,
        status: this.modifyContactGroupForm.controls.status.value,
        contactsData: formObj.contactsData
      };
      
      this.rerender();
      this.currentUserData[0].groupsData.push(this.createContactGroupObj);
      
      for (let user of this.usersData) {
        if (user.username === this.currentUserData[0].username) {
          break;
        }
        user.groupsData.push(this.currentUserData[0].groupsData);
      }
      console.log('after for push', this.usersData);
      localStorage.setItem("usersData", JSON.stringify(this.usersData));
      this.createContactGroupForm.reset();
      
      jQuery('#modifyGroupModal').modal('hide');
    } else {
      // === Create row
      console.log('no formobj');
      // === stop here if form is invalid
      if (this.createContactGroupForm.invalid) {
        return;
      }

      this.groupStatus = 'inactive';
      this.createContactGroupObj = {
        name: this.createContactGroupForm.controls.groupName.value,
        createdDate: this.currentDate,
        status: this.groupStatus,
        contactsData: []
      };
      this.tableView = true;
      this.rerender();

      this.currentUserData[0].groupsData.push(this.createContactGroupObj);

      for (let user of this.usersData) {
        if (user.username === this.currentUserData[0].username) {
          break;
        }
        user.groupsData.push(this.currentUserData[0].groupsData);
      }
      console.log("final", this.usersData);
      localStorage.setItem("usersData", JSON.stringify(this.usersData));
      this.createContactGroupForm.reset();
      jQuery('#createGroupModal').modal('hide');
      
    }
   
  }

  loadAllUsers() {
    this.userService
      .getAll()
      .pipe(first())
      .subscribe(users => {
        this.users = users;
      });
  }
  // === Rerending table
  rerender() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }

  // === View contact group
  createGroup() {
    // this.createContactGroupForm.reset();
    this.submitted = false;
    jQuery('#createGroupModal').modal('show');
  }
  // === View contact group
  viewGroup(groupObj) {
    console.log('viewing group page', groupObj);
    this.dataSharing.changeConctactGroup(groupObj);
    this.router.navigate(['/contact-group-details']);
  }

  // === Modify contact group
  modifyGroup(obj) {
    this.selectedGroup = obj;
    console.log('this.selectedGroup', this.selectedGroup);
    this.modifyContactGroupForm.reset();
    jQuery('#modifyGroupModal').modal('show');
    this.modifyContactGroupForm.controls.groupName.setValue(obj.name);
    this.modifyContactGroupForm.controls.status.setValue(obj.status);
  }

  // === Delete contact group
  deleteGroup(obj) {
    jQuery('#confirmDeleteModal').modal('show');
    this.selectedGroup = obj;
  }

  // === Confirm delete contact group
  confirmDeleteGroup(groupObj) {
    console.log('groupObj', groupObj);

    for (const group of this.groupsData) {
      if (groupObj.name === group.name) {
        this.groupsData.splice(this.groupsData.indexOf(group), 1);
        break;
      }
    }

    for (const user of this.usersData) {
      if (user.username == this.currentUserData[0].username) {
        break;
      }
      user.groupsData.push(this.currentUserData[0].groupsData);
    }
    console.log('delete usersdata', this.usersData);
    localStorage.setItem('usersData', JSON.stringify(this.usersData));
    jQuery('#confirmDeleteModal').modal('hide');
    // window.location.reload();
    this.rerender();
    this.submitted = false;
  }

  isEmptyObject(obj) {
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return false;
      }
    }
    return true;
  }
}
