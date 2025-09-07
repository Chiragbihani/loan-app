import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { ApplyLoanComponent } from './components/apply-loan/apply-loan.component';
import { UserLoansComponent } from './components/user-loans/user-loans.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { RepayLoanComponent } from './components/repay-loan/repay-loan.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    HomeComponent,
    ApplyLoanComponent,
    UserLoansComponent,
    AdminDashboardComponent,
    LandingPageComponent,
    RepayLoanComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot([]),
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
