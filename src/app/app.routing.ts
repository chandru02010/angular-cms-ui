import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { LoginComponent } from './login';
import { RegisterComponent } from './register';
import { AuthGuard } from './_guards';
import { ContactGroupDetailsComponent } from './contact-group-details/contact-group-details.component';

const appRoutes: Routes = [
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always' },
    { path: 'contact-group-details', component: ContactGroupDetailsComponent, canActivate: [AuthGuard], runGuardsAndResolvers: 'always' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },

    { path: '', redirectTo: '/home', pathMatch: 'full', canActivate: [AuthGuard], runGuardsAndResolvers: 'always' },
    // otherwise redirect to home
    { path: '**', redirectTo: '/home', canActivate: [AuthGuard], runGuardsAndResolvers: 'always' }
];

export const routing = RouterModule.forRoot(appRoutes, {onSameUrlNavigation: 'reload'});