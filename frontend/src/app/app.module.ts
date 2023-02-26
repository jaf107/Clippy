import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';

import { AppComponent } from './app.component';
import { LandingPageComponent } from './modules/landing-page/landing-page.component';
import { SignInComponent } from './modules/auth/sign-in/sign-in.component';
import { SignUpComponent } from './modules/auth/sign-up/sign-up.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { HomeComponent } from './modules/home/home.component';
import { KnowledgeGraphComponent } from './modules/knowledge-graph/knowledge-graph.component';
import { PdfViewerComponent } from './modules/pdf-viewer/pdf-viewer.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { SummarizerComponent } from './modules/summarizer/summarizer.component';
import { TooltipModule } from 'ng2-tooltip-directive';

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
    SidebarComponent,
    SummarizerComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ToastrModule.forRoot(),
    AppRoutingModule,
    TooltipModule,
    PdfViewerModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})

export class AppModule {}
