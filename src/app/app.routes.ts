import { Routes } from '@angular/router';
import { PdfViewComponent } from './pdf-view/pdf-view.component';
import { CvFormComponent } from './cv-form/cv-form.component';
import { LandingPageComponent } from './landing-page/landing-page.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'form', component: CvFormComponent },
  { path: 'upload', component: PdfViewComponent },
  { path: 'pdf-view', component: PdfViewComponent }
];
