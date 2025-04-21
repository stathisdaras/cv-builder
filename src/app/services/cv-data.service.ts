import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CvDataService {
  private readonly placeholderImage = 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';

  constructor() {}

  uploadJson(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Create file input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json';
      fileInput.style.display = 'none';

      // Handle file selection
      fileInput.onchange = async (event: any) => {
        const file = event.target.files[0];
        if (file) {
          try {
            const data = await this.readFileAsJson(file);
            const processedData = this.processImportedData(data);
            localStorage.setItem('cvData', JSON.stringify(processedData));
            resolve(processedData);
          } catch (error) {
            console.error('Error processing JSON file:', error);
            reject(error);
          } finally {
            // Clean up
            document.body.removeChild(fileInput);
          }
        }
      };

      // Add to DOM and trigger click
      document.body.appendChild(fileInput);
      fileInput.click();
    });
  }

  private readFileAsJson(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }

  private processImportedData(data: any): any {
    // Transform skills data if it's not in the correct format
    if (data.skills && !Array.isArray(data.skills)) {
      data.skills = Object.entries(data.skills).map(([category, items]) => ({
        category,
        items: Array.isArray(items) ? items : [items]
      }));
    }

    // Transform language proficiency if needed
    if (data.languages) {
      data.languages = data.languages.map((lang: any) => ({
        ...lang,
        proficiency: this.normalizeProficiency(lang.proficiency)
      }));
    }

    // Set profile image or use placeholder
    data.profileImage = data.profileImage || this.placeholderImage;

    return data;
  }

  private normalizeProficiency(proficiency: any): number {
    if (typeof proficiency === 'number') {
      return Math.min(Math.max(Math.round(proficiency), 1), 5);
    }
    
    // Handle string proficiency levels
    const proficiencyMap: { [key: string]: number } = {
      'native': 6,
      'fluent': 5,
      'c2': 6,
      'c1': 5,
      'advanced': 5,
      'b2': 4,
      'intermediate': 4,
      'b1': 4,
      'a2': 2,
      'basic': 2,
      'a1': 1,
      'beginner': 1
    };

    if (typeof proficiency === 'string') {
      const normalizedProf = proficiency.toLowerCase().trim();
      return proficiencyMap[normalizedProf] || 3; // Default to intermediate (3) if unknown
    }

    return 3; // Default to intermediate
  }
} 