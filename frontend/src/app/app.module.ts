import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { ClipboardModule } from '@angular/cdk/clipboard'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSpinnerModule } from 'ngx-spinner';

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
import { PdfViewerModule } from './modules/pdf-viewer-custom-library/pdf-viewer.module';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { PdfPreviewComponent } from './modules/pdf-viewer/pdf-preview/pdf-preview.component';
import { ExamplePdfViewerComponent } from './example-pdf-viewer/example-pdf-viewer.component';
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
    SidebarComponent,
    SummarizerComponent,
    PdfPreviewComponent,
    ExamplePdfViewerComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ToastrModule.forRoot(),
    AppRoutingModule,
    PdfViewerModule,
    ClipboardModule,
    FontAwesomeModule,
    NgxSpinnerModule,
    NgxExtendedPdfViewerModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class AppModule {}
platformBrowserDynamic().bootstrapModule(AppModule);

