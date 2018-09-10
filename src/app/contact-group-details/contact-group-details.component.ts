import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { first, takeUntil } from 'rxjs/operators';

import { DataTableDirective } from 'angular-datatables';

// import { takeUntil } from 'rxjs/operators';
import { DataSharingService }  from '../_services/data-sharing.service';

import { User } from '../_models';
import { UserService } from '../_services';
import { Subject } from 'rxjs';

declare var jQuery:any;
// import * as $ from 'jquery'; 

@Component({
  selector: 'app-contact-group-details',
  templateUrl: './contact-group-details.component.html',
  host: {
      '(window:resize)': 'onResize($event)'
  }
})
export class ContactGroupDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
    submitted:boolean = false;
    createContactForm: FormGroup;
    modifyContactForm: FormGroup;
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    @ViewChild('tableDiv') tableDiv: ElementRef;
    @ViewChild('tableWrapper') tableWrapper: ElementRef;
    private onDestroy$ = new Subject<void>();
    currentUser: User;
    users: User[] = [];
    dtOptions: DataTables.Settings = {};
    // dtOptions: Promise<DataTables.Settings>;
    dtTrigger: Subject<any> = new Subject();
    dtInstance = {};
    pageLoading:boolean;
    tableView:boolean;
    dataLoadingError:boolean;
    usersData = [];
    contactGroupObj:any;
    contactsData = [];
    selectedContact:any;
    createContactObj = {}
    createFirstContact:boolean;
    pipe = new DatePipe('en-US');
    currentDate:string;
    contactStatus:string;

    commonPlaceholder:string = "Please enter value";

    contactRE = /^\d{10}$/;;
    emailRE = /^[A-Za-z0-9._%+-]+@inmar.com$/

    constructor(
        private router: Router,
        private aRoute: ActivatedRoute,
        private userService: UserService,
        private dataSharing: DataSharingService,
        private formBuilder: FormBuilder) {
        
        this.tableView = true;
        this.dataLoadingError = false;
        this.pageLoading = false;
        this.createFirstContact = false;

        this.currentDate = this.pipe.transform(Date.now(), 'dd/MM/yyyy');
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        console.log(localStorage);
        this.usersData = JSON.parse(localStorage.getItem('usersData'));
        console.log("userData==", this.usersData);
    }

    ngOnInit() {
        // === Datatable options
        this.dtOptions = {
            paging: true,
            searching: true,
            pagingType: 'full_numbers',
            pageLength: 10,
            lengthMenu: [5, 10, 25, 50, 100],
            responsive: true,
            language: {
                search: "Search records here: ",
            }
        }

        // === Getting contact group object
        this.dataSharing.currentConctactGroup.pipe(takeUntil(this.onDestroy$)).subscribe((groupObj:any) => {
          console.log("groupObj..", groupObj);
          this.contactGroupObj = groupObj;
          this.contactsData = groupObj.contactsData;
          this.pageLoading = false;
        });
        if(this.isEmptyObject(this.contactGroupObj)) {
            console.log("empty");
            this.router.navigate(['/home']);
            // this.tableView = false;
        }
        else {
            console.log("contactsData", this.contactsData);
        }
        
        // === Load all Users
        this.loadAllUsers();

        this.createContactForm = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', Validators.compose([Validators.required, Validators.pattern(this.emailRE)])],
            contactNo: ['', Validators.compose([Validators.required, Validators.pattern(this.contactRE)])]
        });
        this.modifyContactForm = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', Validators.compose([Validators.required, Validators.pattern(this.emailRE)])],
            contactNo: ['', Validators.compose([Validators.required, Validators.pattern(this.contactRE)])],
            status: ['']
        });
    }

    ngAfterViewInit(): void {
        this.dtTrigger.next();
    }
    ngOnDestroy(): void {
        this.dtTrigger.unsubscribe();
    }

    // === Setting form controls to "f"
    get f() { return this.createContactForm.controls; };

    // === Setting form controls to "m"
    get m() { return this.modifyContactForm.controls; };

    updateStatus(value) {
        this.modifyContactForm.controls.status.setValue(value.target.value);
    }
    // === Form submit
    formSubmit(event, formObj) {
        console.log("this.", formObj);
        this.submitted = true;
        
        // Modify form submit
        if(formObj) {

            if (this.modifyContactForm.invalid) {
                return;
            };
            for(const contact of this.contactsData) {
                if(formObj.firstName === contact.firstName) {
                    this.contactsData.splice(this.contactsData.indexOf(contact), 1);
                    break;
                }
            }
            this.createContactObj = {
                firstName: this.modifyContactForm.controls.firstName.value,
                lastName: this.modifyContactForm.controls.lastName.value,
                email: this.modifyContactForm.controls.email.value,
                contactNo: this.modifyContactForm.controls.contactNo.value,
                createdDate: this.currentDate,
                status: this.modifyContactForm.controls.status.value
            }

            this.contactsData.push(this.createContactObj);
            this.rerender();
              
            for (let group of this.usersData[0].groupsData) {
                if (this.contactGroupObj.name === group.name) {
                    console.log("group", group);
                    group.contactsData = this.contactGroupObj.contactsData;
                    console.log("group.contactsData", group.contactsData);
                    break;
                }
            }
            localStorage.setItem("usersData", JSON.stringify(this.usersData));
            this.modifyContactForm.reset();
            
            jQuery('#modifyGroupModal').modal('hide');
              

        }
        // === Create form submit
        else {
            console.log("fresh form");
            // stop here if form is invalid
            if (this.createContactForm.invalid) {
                return;
            };

            this.contactStatus = "inactive";
            this.createContactObj = {
                firstName: this.createContactForm.controls.firstName.value,
                lastName: this.createContactForm.controls.lastName.value,
                email: this.createContactForm.controls.email.value,
                contactNo: this.createContactForm.controls.contactNo.value,
                createdDate: this.currentDate,
                status: this.contactStatus
            }            
            
            this.rerender();
            this.contactsData.push(this.createContactObj);
            for (let group of this.usersData[0].groupsData) {
                if (this.contactGroupObj.name === group.name) {
                    console.log("group", group);
                    group.contactsData.push(this.createContactObj);
                    break;
                }
            }
            localStorage.setItem("usersData", JSON.stringify(this.usersData));
            this.usersData = JSON.parse(localStorage.getItem("usersData"));
            
            jQuery('#createGroupModal').modal('hide');
            this.createContactForm.reset();
        }
        this.submitted = false;
        // window.location.reload();
        
    }
    // Resizing table on window resize
    onResize(event){
        this.tableDiv.nativeElement.style.width = `${this.tableWrapper.nativeElement.offsetWidth-30}px`
        console.log(this.tableDiv.nativeElement.style.width);
    }

    loadAllUsers() {
        this.userService.getAll().pipe(first()).subscribe(users => { 
            this.users = users;
        });
    }

    rerender(): void {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          // Destroy the table first
          dtInstance.destroy();
          // Call the dtTrigger to rerender again
          this.dtTrigger.next();
        });
    }

    // Back button
    backBtn() {
        this.router.navigate(['../home'], {relativeTo: this.aRoute})
    }
    createContact() {
        this.createContactForm.reset();
        jQuery('#createGroupModal').modal('show');
    }
    // View contact group 
    viewGroup(groupObj) {
        console.log("viewing group page", groupObj);
    }

    // === Modify contact group 
    modifyGroup(obj) {
        this.selectedContact = obj;
        console.log("this.selectedContact", this.selectedContact);
        jQuery('#modifyGroupModal').modal('show');
        this.modifyContactForm.controls.firstName.setValue(obj.firstName);
        this.modifyContactForm.controls.lastName.setValue(obj.lastName);
        this.modifyContactForm.controls.email.setValue(obj.email);
        this.modifyContactForm.controls.contactNo.setValue(obj.contactNo);
        this.modifyContactForm.controls.status.setValue(obj.status);
    }

    // === Delete contact group

    deleteGroup(obj) {
        jQuery('#confirmDeleteModal').modal('show');
        this.selectedContact = obj;
    }

    confirmDeleteGroup(groupObj) {
        if(this.contactsData.length>1) {
            for (const contact of this.contactsData) {
                if (groupObj.firstName === contact.firstName) {
                    this.contactsData.splice(this.contactsData.indexOf(contact), 1);
                    break;
                }
            }

            this.usersData[0].groupsData

            for (const group of this.usersData[0].groupsData) {
                if (group.name == this.contactGroupObj.name) {
                    console.log("group", group);
                    group.contactsData = this.contactsData;
                    console.log("pus>>", group.contactsData);
                    break;
                }
                // group.contactsData = this.contactGroupObj;
                
                
            }
        }
        else {
            console.log("only one left");
            this.contactsData.splice(0, 1);
            for (const group of this.usersData[0].groupsData) {
                if (this.contactGroupObj.name === group.name) {
                    console.log("group", group);
                    group.contactsData = [];
                    break;
                }
            }
        }
        
        this.rerender();

        localStorage.setItem("usersData", JSON.stringify(this.usersData));
        this.usersData = JSON.parse(localStorage.getItem("usersData"));
        jQuery('#confirmDeleteModal').modal('hide');
        this.createContactForm.reset();
    }

    isEmptyObject(obj) {
        for(var prop in obj) {
           if (obj.hasOwnProperty(prop)) {
              return false;
           }
        }
    
        return true;
    }
}