import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './modules/auth/sign-in/sign-in.component';
import { SignUpComponent } from './modules/auth/sign-up/sign-up.component';
import { HomeComponent } from './modules/home/home.component';
import { KnowledgeGraphComponent } from './modules/knowledge-graph/knowledge-graph.component';
import { LandingPageComponent } from './modules/landing-page/landing-page.component';
import { PdfViewerComponent } from './modules/pdf-viewer/pdf-viewer.component';

const routes: Routes = [
  {path: '', component: LandingPageComponent},
  {path: 'login', component: SignInComponent},
  {path: 'signup', component: SignUpComponent},
  {path: 'home', component: HomeComponent},
  {path: 'pdfviewer', component: PdfViewerComponent},
  {path: 'graph', component: KnowledgeGraphComponent},
  {path:'pdf', component: PdfViewerComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
