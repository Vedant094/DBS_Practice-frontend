import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsersComponent } from './components/users/users.component';
import { ManagersComponent } from './components/managers/managers.component';
import { RequestsComponent } from './components/requests/requests.component';
import { AuthGuard } from './auth/auth.guard';
import { RegisterUserComponent } from './components/users/register-user/register-user';
import { RegisterManagerComponent } from './components/managers/register-manager/register-manager';
import { ManagerDashboardComponent } from './components/managers/manager-dashboard/manager-dashboard';
import { ManagerUsersComponent } from './components/manager-users/manager-users';
import { ManagerRequestsComponent } from './components/manager-requests/manager-requests';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard';
import { SubmitRequestComponent } from './components/submit-request/submit-request';
import { MyRequestsComponent } from './components/my-requests/my-requests';
import { Home } from './components/home/home';
const routes: Routes = [
  // Public Home Page
  { path: '', component: Home },

  // Public Auth Pages
  { path: 'login', component: LoginComponent },
  { path: 'register-user', component: RegisterUserComponent },
  { path: 'register-manager', component: RegisterManagerComponent },

  // Protected user pages
  { path: 'user-dashboard', component: UserDashboardComponent, canActivate: [AuthGuard] },
  { path: 'submit-request', component: SubmitRequestComponent, canActivate: [AuthGuard] },
  { path: 'my-requests', component: MyRequestsComponent, canActivate: [AuthGuard] },

  // Protected manager pages
  { path: 'manager-dashboard', component: ManagerDashboardComponent, canActivate: [AuthGuard] },
  { path: 'manager-users', component: ManagerUsersComponent, canActivate: [AuthGuard] },
  { path: 'manager-requests', component: ManagerRequestsComponent, canActivate: [AuthGuard] },

  // Admin listing pages (protected)
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
  { path: 'managers', component: ManagersComponent, canActivate: [AuthGuard] },
  { path: 'requests', component: RequestsComponent, canActivate: [AuthGuard] },

  // fallback
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
