import { Component } from '@angular/core';
import { RouterModule, Router, NavigationExtras } from '@angular/router';
import sampleCv from '../../assets/sample-cv.json';
import { CvDataService } from '../services/cv-data.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
  standalone: true,
  imports: [RouterModule]
})
export class LandingPageComponent {
  constructor(
    private router: Router,
    private cvDataService: CvDataService
  ) {}

  navigateToNewForm() {
    // Navigate to form with state indicating it's coming from landing page
    const navigationExtras: NavigationExtras = {
      state: { fromLanding: true }
    };
    this.router.navigate(['/form'], navigationExtras);
  }

  async onUploadClick() {
    try {
      // Upload JSON and navigate to PDF view when successful
      const data = await this.cvDataService.uploadJson();
      if (data) {
        // Data is already saved to localStorage in the service
        this.router.navigate(['/pdf-view']);
      }
    } catch (error) {
      console.error('Error uploading JSON:', error);
      alert('Error uploading JSON file. Please try again.');
    }
  }

  loadSampleCv() {
    // Save the sample CV data to localStorage
    try {
      localStorage.setItem('cvData', JSON.stringify(sampleCv));
      console.log('Sample CV data loaded');
      
      // Navigate to the PDF view to display the sample CV
      this.router.navigate(['/pdf-view']);
    } catch (error) {
      console.error('Error loading sample CV:', error);
      alert('Error loading sample CV data. Please try again.');
    }
  }

  downloadSampleJson() {
    const jsonStr = JSON.stringify(sampleCv, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample-cv.json';
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
