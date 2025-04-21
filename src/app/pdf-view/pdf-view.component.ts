import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import html2pdf from 'html2pdf.js';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CvDataService } from '../services/cv-data.service';

@Component({
  selector: 'app-pdf-view',
  templateUrl: './pdf-view.component.html',
  styleUrls: ['./pdf-view.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
  ]
})
export class PdfViewComponent implements OnInit {
  @ViewChild('imageInput') imageInput!: ElementRef;
  cvData: any = null;
  profileImage: string | null = null;
  readonly placeholderImage = '../../assets/images/placeholder-image.png';
  showMobileMenu = false;

  constructor(
    private cvDataService: CvDataService,
    private router: Router
  ) {}

  ngOnInit() {
    // Try to load data from localStorage
    const storedData = localStorage.getItem('cvData');
    if (storedData) {
      try {
        this.cvData = JSON.parse(storedData);
        this.profileImage = this.cvData.profileImage || this.placeholderImage;
        this.transformSkillsData();
      } catch (error) {
        console.error('Error parsing stored JSON data:', error);
        this.cvData = null;
        this.profileImage = this.placeholderImage;
      }
    } else {
      // No data available
      this.cvData = null;
      this.profileImage = this.placeholderImage;
    }
  }

  /**
   * Transform skills data into the format expected by the PDF view
   */
  private transformSkillsData() {
    if (!this.cvData || !this.cvData.skills) return;
    
    // If skills is already an array in the expected format, no need to transform
    if (Array.isArray(this.cvData.skills) && 
        this.cvData.skills.length > 0 && 
        this.cvData.skills[0].category) {
      console.log('Skills data is already in the expected format');
      return;
    }
    
    // If skills is an object with categories as keys, transform to array format
    if (typeof this.cvData.skills === 'object' && !Array.isArray(this.cvData.skills)) {
      console.log('Converting skills from object format to array format');
      const transformedSkills = Object.entries(this.cvData.skills).map(([category, items]) => {
        return {
          category: category,
          items: Array.isArray(items) ? items : [items]
        };
      });
      this.cvData.skills = transformedSkills;
      console.log('Transformed skills:', this.cvData.skills);
    }
  }

  async onUploadClick() {
    try {
      this.cvData = await this.cvDataService.uploadJson();
      this.profileImage = this.cvData.profileImage;
    } catch (error) {
      console.error('Error uploading JSON:', error);
      alert('Error uploading JSON file. Please try again.');
    }
  }

  triggerImageUpload() {
    this.imageInput.nativeElement.click();
  }

  removeProfileImage() {
    // Reset to placeholder image
    this.profileImage = this.placeholderImage;
    
    // Update the CV data
    if (this.cvData) {
      this.cvData.profileImage = null;
      
      // Save to localStorage
      localStorage.setItem('cvData', JSON.stringify(this.cvData));
      console.log('Profile image removed');
    }
  }

  onImageUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        // Store the full quality image
        this.profileImage = e.target?.result as string;
        if (this.cvData) {
          this.cvData.profileImage = this.profileImage;
          
          // Save to localStorage (with warning about large images)
          try {
            localStorage.setItem('cvData', JSON.stringify(this.cvData));
          } catch (err) {
            console.error('Error saving to localStorage:', err);
            alert('Your image is too large to be saved in the browser. Please use a smaller image.');
            
            // Reset the image to placeholder
            this.profileImage = this.placeholderImage;
            this.cvData.profileImage = this.placeholderImage;
          }
        }
      };
      reader.readAsDataURL(file);
    }
  }

  getSkillCategories(): string[] {
    if (!this.cvData?.skills) {
      console.log('No skills data found');
      return [];
    }
    
    // Handle array format - expected: [{category: string, items: string[]}]
    if (Array.isArray(this.cvData.skills)) {
      const categories = this.cvData.skills
        .filter((skill: any) => skill && skill.category)
        .map((skill: any) => skill.category);
      console.log('Found skill categories (array format):', categories);
      return categories;
    }
    
    // Handle object format - expected: {category1: string[], category2: string[]}
    if (typeof this.cvData.skills === 'object') {
      const categories = Object.keys(this.cvData.skills);
      console.log('Found skill categories (object format):', categories);
      return categories;
    }
    
    console.log('Unknown skills data format');
    return [];
  }

  getSkillsForCategory(category: string): string[] {
    if (!this.cvData?.skills) {
      return [];
    }
    
    // Handle array format
    if (Array.isArray(this.cvData.skills)) {
      const skill = this.cvData.skills.find((s: any) => s.category === category);
      if (skill) {
        // Check if skills are in the 'items' property or directly in the skill object
        if (Array.isArray(skill.items)) {
          return skill.items;
        } else if (Array.isArray(skill.skills)) {
          return skill.skills;
        } else if (Array.isArray(skill.values)) {
          return skill.values;
        }
      }
      return [];
    }
    
    // Handle object format
    if (typeof this.cvData.skills === 'object') {
      const skills = this.cvData.skills[category];
      if (Array.isArray(skills)) {
        return skills;
      } else if (skills) {
        return [skills];
      }
    }
    
    return [];
  }

  getProficiencyDots(proficiency: number | string): number[] {
    // Handle string-based CEFR levels (A1-C2, Native)
    if (typeof proficiency === 'string') {
      const proficiencyMap: { [key: string]: number } = {
        'A1': 1,
        'A2': 2,
        'B1': 3,
        'B2': 4,
        'C1': 5,
        'C2': 6,
        'NATIVE': 6
      };
      
      const level = proficiency.toUpperCase();
      const dots = proficiencyMap[level] || 3; // Default to B1 (3 dots) if unknown
      return Array(dots).fill(0);
    }
    
    // Handle numeric proficiency (1-5 scale)
    if (typeof proficiency === 'number') {
      const normalizedProf = Math.min(Math.max(Math.round(proficiency), 1), 5);
      return Array(normalizedProf).fill(0);
    }
    
    // Default to 3 dots (B1 level) if no valid proficiency
    return Array(3).fill(0);
  }

  async downloadPDF() {
    const element = document.getElementById('pdf-content');
    if (!element) {
      console.error('PDF content element not found');
      return;
    }

    // Force the profile header to horizontal layout for PDF generation
    const headerElement = document.getElementById('profile-header');
    let originalClasses = '';
    if (headerElement) {
      originalClasses = headerElement.className;
      headerElement.className = originalClasses.replace('flex-col', 'flex-row');
    }

    // Compress the profile image if it exists
    let originalProfileImage = this.profileImage;
    if (this.profileImage && this.profileImage !== this.placeholderImage && this.profileImage.startsWith('data:image')) {
      try {
        // Create a temporary image element to resize the image
        const img = new Image();
        img.src = this.profileImage;
        
        // Wait for image to load
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        // Create a canvas to resize the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');  
        
        // Set max dimensions for profile picture
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        
        // Calculate dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        // Resize image
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed JPEG format
        const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
        
        // Temporarily replace the profile image with the compressed version
        this.profileImage = compressedImage;
        
        // Update the image in the DOM
        const profileImg = element.querySelector('.flex-shrink-0 img') as HTMLImageElement;
        if (profileImg) {
          profileImg.src = compressedImage;
        }
      } catch (error) {
        console.error('Error compressing profile image:', error);
      }
    }

    // Optimize margins to reduce whitespace
    const options = {
      margin: 10, // Simplified margin - using a single number to avoid type errors
      filename: `${this.cvData?.name || 'cv'}.pdf`,
      image: { type: 'jpeg', quality: 0.8 }, // Use JPEG with 80% quality instead of PNG
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false 
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' as const,
        compress: true // Enable compression
      },
      pagebreak: { 
        mode: 'css',
        avoid: '.avoid-break-inside'
      }
    };

    try {
      await html2pdf().set(options).from(element).save();
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      // Restore the original profile image
      if (originalProfileImage) {
        this.profileImage = originalProfileImage;
      }
      
      // Restore original layout classes
      if (headerElement && originalClasses) {
        headerElement.className = originalClasses;
      }
    }
  }

  editCV() {
    // Make sure current data is saved in localStorage
    if (this.cvData) {
      const dataStr = JSON.stringify(this.cvData);
      console.log('Saving data to localStorage before editing:', dataStr.substring(0, 100) + '...');
      localStorage.setItem('cvData', dataStr);
      
      // First, set a flag in sessionStorage to indicate we're in edit mode
      // This is more reliable than navigation state
      sessionStorage.setItem('editMode', 'true');
      
      // Then navigate to the form
      this.router.navigate(['/form']);
    } else {
      console.error('No CV data available to edit');
      alert('No CV data available to edit');
    }
  }

  // Toggle mobile menu visibility
  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }
}
