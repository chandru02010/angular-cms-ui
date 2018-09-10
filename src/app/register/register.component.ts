import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AlertService, UserService } from '../_services';
// import { PasswordValidation } from '../_validators/password-validation'

function passwordConfirming(c: AbstractControl): any {
    if(!c.parent || !c) return;
    const pwd = c.parent.get('password');
    const cpwd= c.parent.get('confirmPassword')

    if(!pwd || !cpwd) return ;
    if (pwd.value !== cpwd.value) {
        return { invalid: true };

    }
}

@Component({templateUrl: 'register.component.html'})
export class RegisterComponent implements OnInit {
    
    registerForm: FormGroup;
    loading = false;
    submitted = false;
    get cpwd() {
    return this.registerForm.get('confirmPassword');
    }

    // emailRE = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    emailRE = /^[A-Za-z0-9._%+-]+@inmar.com$/
    aadhaarRE = /^\d{12}$/;
    passwordStrongRE = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}/
    passwordMatch = ''

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private userService: UserService,
        private alertService: AlertService) { }

    ngOnInit() {
        this.registerForm = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            username: ['', Validators.compose([Validators.required, Validators.pattern(this.emailRE)])],
            aadhaar: ['', Validators.compose([Validators.required, Validators.pattern(this.aadhaarRE)])],
            password: ['', [Validators.required, Validators.pattern(this.passwordStrongRE)]],
            confirmPassword: ['', [Validators.required, passwordConfirming] ]
        });
    }
    // passwordConfirming(c: AbstractControl): { invalid: boolean } {
    //     if (c.get('password').value !== c.get('confirm_password').value) {
    //         return {invalid: true};
    //     }
    // }

    // convenience getter for easy access to form fields
    get f() { return this.registerForm.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.registerForm.invalid) {
            return;
        }

        this.loading = true;
        this.userService.register(this.registerForm.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.alertService.success('Registration successful', true);
                    this.router.navigate(['/login']);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }
}
