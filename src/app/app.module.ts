import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsersComponent } from './components/users/users.component';
import { ManagersComponent } from './components/managers/managers.component';
import { RequestsComponent } from './components/requests/requests.component';

import { AuthService } from './auth/auth.service';
import { TokenInterceptor } from './auth/token.interceptor';
import { AuthGuard } from './auth/auth.guard';
import { RegisterManagerComponent } from './components/managers/register-manager/register-manager';
import { RegisterUserComponent } from './components/users/register-user/register-user';
import { ManagerDashboardComponent } from './components/managers/manager-dashboard/manager-dashboard';
import { ManagerUsersComponent } from './components/manager-users/manager-users';
import { ManagerRequestsComponent } from './components/manager-requests/manager-requests';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard';
import { SubmitRequestComponent } from './components/submit-request/submit-request';
import { MyRequestsComponent } from './components/my-requests/my-requests';
import { NavbarComponent } from "./components/navbar/navbar";
import { CommonModule } from '@angular/common';
import { Home } from './components/home/home';

@NgModule({
  declarations: [
    AppComponent,
    Home,
    LoginComponent,
    DashboardComponent,
    UsersComponent,
    ManagersComponent,
    RequestsComponent,
    RegisterManagerComponent,
    RegisterUserComponent,
    ManagerDashboardComponent,
    ManagerUsersComponent,
    ManagerRequestsComponent,
    UserDashboardComponent,
    SubmitRequestComponent,
    MyRequestsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    CommonModule
  ],
  providers: [
    AuthService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}



