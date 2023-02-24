import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';    
import { ToastrModule } from 'ngx-toastr';  

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './modules/landing-page/landing-page.component';
import { SignInComponent } from './modules/auth/sign-in/sign-in.component';
import { SignUpComponent } from './modules/auth/sign-up/sign-up.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { HomeComponent } from './modules/home/home.component';
import { KnowledgeGraphComponent } from './modules/knowledge-graph/knowledge-graph.component';
import { PdfViewerComponent } from './modules/pdf-viewer/pdf-viewer.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    SignInComponent,
    SignUpComponent,
    NavbarComponent,
    HomeComponent,
    KnowledgeGraphComponent,
    PdfViewerComponent,
    SidebarComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    AppRoutingModule,
    NgxExtendedPdfViewerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
