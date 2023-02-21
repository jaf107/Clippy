import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import * as d3 from "d3";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './modules/landing-page/landing-page.component';
import { SignInComponent } from './modules/auth/sign-in/sign-in.component';
import { SignUpComponent } from './modules/auth/sign-up/sign-up.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { HomeComponent } from './modules/home/home.component';
import { KnowledgeGraphComponent } from './modules/knowledge-graph/knowledge-graph.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    SignInComponent,
    SignUpComponent,
    NavbarComponent,
    HomeComponent,
    KnowledgeGraphComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
