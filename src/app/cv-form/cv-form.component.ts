import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CvDataService } from '../services/cv-data.service';
import { DatePickerModule } from 'primeng/datepicker';
import { MonthYearPickerComponent } from '../month-year-picker/month-year-picker.component';

@Component({
  selector: 'app-cv-form',
  templateUrl: './cv-form.component.html',
  standalone: true,
  styleUrls: ['../../app/datepicker-fix.css'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DatePickerModule,
    MonthYearPickerComponent
  ]
})
export class CvFormComponent implements OnInit {
  cvForm!: FormGroup;
  submitted = false;
  calendarLocale = {
    firstDayOfWeek: 1,
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  };
  showMobileMenu = false;

  // Language proficiency options for dropdown
  languageProficiencyOptions = [
    { label: 'A1 - Beginner', value: 'A1' },
    { label: 'A2 - Elementary', value: 'A2' },
    { label: 'B1 - Intermediate', value: 'B1' },
    { label: 'B2 - Upper Intermediate', value: 'B2' },
    { label: 'C1 - Advanced', value: 'C1' },
    { label: 'C2 - Proficient', value: 'C2' },
    { label: 'Native Speaker', value: 'Native' }
  ];

  constructor(
    public router: Router,
    private cvDataService: CvDataService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initForm();
    
    // Check for edit mode flag in sessionStorage (more reliable than navigation state)
    const isEditMode = sessionStorage.getItem('editMode') === 'true';
    console.log('Is edit mode (from sessionStorage):', isEditMode);
    
    if (isEditMode) {
      // We're in edit mode, load data from localStorage
      console.log('Loading data from localStorage');
      const storedData = localStorage.getItem('cvData');
      
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          console.log('Data loaded successfully, patching form');
          this.cvForm.patchValue(data);
          this.updateFormArrays(data);
        } catch (error) {
          console.error('Error loading CV data from localStorage:', error);
        }
      } else {
        console.log('No data found in localStorage');
      }
      
      // Clear the edit mode flag
      sessionStorage.removeItem('editMode');
    } else {
      console.log('Starting with empty form (not in edit mode)');
    }
  }

  private initForm() {
    this.cvForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[+]?[(]?[0-9]{1,4}[)]?[-\\s./0-9]*$')]],
      title: ['', Validators.required],
      profileImage: [''],
      briefProfile: ['', [Validators.required, Validators.minLength(50)]],
      skills: this.fb.group({}),
      workExperiences: this.fb.array([]),
      education: this.fb.array([]),
      certifications: this.fb.array([]),
      languages: this.fb.array([]),
      interests: this.fb.array([])
    });
  }

  // Form Arrays Getters
  get workExperiencesArray() {
    return this.cvForm.get('workExperiences') as FormArray;
  }

  get educationArray() {
    return this.cvForm.get('education') as FormArray;
  }

  get certificationsArray() {
    return this.cvForm.get('certifications') as FormArray;
  }

  get languagesArray() {
    return this.cvForm.get('languages') as FormArray;
  }

  get interestsArray() {
    return this.cvForm.get('interests') as FormArray;
  }

  // Date formatting methods
  formatMonthYear(date: Date | string): string {
    if (!date) return '';
    
    if (typeof date === 'string') {
      if (date === 'Present') return 'Present';
      
      // Return the string as is if it's already formatted
      if (/^[A-Za-z]{3} \d{4}$/.test(date)) {
        return date;
      }
      
      // Try to parse the MM/YYYY format
      const parts = date.split('/');
      if (parts.length === 2) {
        const month = parseInt(parts[0]);
        const year = parseInt(parts[1]);
        if (!isNaN(month) && !isNaN(year)) {
          const dateObj = new Date(year, month - 1);
          return `${this.calendarLocale.monthNamesShort[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
        }
      }
      
      return date;
    }
    
    return `${this.calendarLocale.monthNamesShort[date.getMonth()]} ${date.getFullYear()}`;
  }

  parseDate(value: string): Date | null {
    if (!value || value === 'Present') return null;
    
    // Try to parse "MMM YYYY" format (e.g., "Jan 2022")
    const parts = value.split(' ');
    if (parts.length === 2) {
      const monthStr = parts[0];
      const year = parseInt(parts[1]);
      
      if (!isNaN(year)) {
        const monthIndex = this.calendarLocale.monthNamesShort.findIndex(
          m => m.toLowerCase() === monthStr.toLowerCase()
        );
        
        if (monthIndex !== -1) {
          return new Date(year, monthIndex);
        }
      }
    }
    
    // Try to parse MM/YYYY format
    const slashParts = value.split('/');
    if (slashParts.length === 2) {
      const month = parseInt(slashParts[0]);
      const year = parseInt(slashParts[1]);
      
      if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12) {
        return new Date(year, month - 1);
      }
    }
    
    return null;
  }

  onDateSelect(control: any, value: Date) {
    if (value && control) {
      const formatted = this.formatMonthYear(value);
      control.setValue(formatted);
    }
  }

  togglePresentCheckbox(control: any, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox && control) {
      control.setValue(checkbox.checked ? 'Present' : '');
    }
  }

  // Create Form Groups
  private createWorkExperienceGroup(): FormGroup {
    return this.fb.group({
      company: ['', Validators.required],
      position: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(50)]],
      mainContributions: this.fb.array([]),
      techStack: this.fb.array([])
    });
  }

  private createEducationGroup(): FormGroup {
    return this.fb.group({
      institution: ['', Validators.required],
      degree: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      thesis: [''],
      supervisor: ['']
    });
  }

  private createCertificationGroup(): FormGroup {
    return this.fb.group({
      certificationName: ['', Validators.required],
      institution: ['', Validators.required]
    });
  }

  private createLanguageGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      institute: ['', Validators.required],
      proficiency: ['B1', Validators.required]
    });
  }

  async onUploadClick() {
    try {
      const data = await this.cvDataService.uploadJson();
      this.cvForm.patchValue(data);
      // Handle arrays
      this.updateFormArrays(data);
    } catch (error) {
      console.error('Error uploading JSON:', error);
      alert('Error uploading JSON file. Please try again.');
    }
  }

  /**
   * Update form arrays with data loaded from localStorage
   */
  private updateFormArrays(data: any) {
    try {
      console.log('Updating form arrays with data:', Object.keys(data).join(', '));
      
      // Handle work experiences array
      if (data.workExperiences) {
        if (Array.isArray(data.workExperiences)) {
          console.log(`Processing ${data.workExperiences.length} work experiences`);
          this.setFormArray('workExperiences', data.workExperiences);
        } else {
          console.warn('Work experiences is not an array:', typeof data.workExperiences);
        }
      }
      
      // Handle education array
      if (data.education) {
        if (Array.isArray(data.education)) {
          console.log(`Processing ${data.education.length} education entries`);
          this.setFormArray('education', data.education);
        } else {
          console.warn('Education is not an array:', typeof data.education);
        }
      }
      
      // Handle certifications array
      if (data.certifications) {
        if (Array.isArray(data.certifications)) {
          console.log(`Processing ${data.certifications.length} certifications`);
          this.setFormArray('certifications', data.certifications);
        } else {
          console.warn('Certifications is not an array:', typeof data.certifications);
        }
      }
      
      // Handle languages array
      if (data.languages) {
        if (Array.isArray(data.languages)) {
          console.log(`Processing ${data.languages.length} languages`);
          this.setFormArray('languages', data.languages);
        } else {
          console.warn('Languages is not an array:', typeof data.languages);
        }
      }
      
      // Handle interests array - could be array of strings or array of objects
      if (data.interests) {
        if (Array.isArray(data.interests)) {
          console.log(`Processing ${data.interests.length} interests`);
          
          // Clear the existing array
          const interestsArray = this.cvForm.get('interests') as FormArray;
          while (interestsArray.length) {
            interestsArray.removeAt(0);
          }
          
          // Add each interest
          data.interests.forEach((interest: any) => {
            if (typeof interest === 'string') {
              interestsArray.push(this.fb.control(interest));
            } else if (interest.name) {
              interestsArray.push(this.fb.control(interest.name));
            }
          });
        } else {
          console.warn('Interests is not an array:', typeof data.interests);
        }
      }
      
      // Handle skills - could be complex object or array
      if (data.skills) {
        if (Array.isArray(data.skills)) {
          console.log(`Processing ${data.skills.length} skills entries`);
          
          const skillsGroup = this.cvForm.get('skills') as FormGroup;
          
          // Clear existing skills
          Object.keys(skillsGroup.controls).forEach(key => {
            skillsGroup.removeControl(key);
          });
          
          // Process skills by category
          data.skills.forEach((skillEntry: any) => {
            if (skillEntry.category && skillEntry.items && Array.isArray(skillEntry.items)) {
              // Format: {category: string, items: string[]}
              const categoryArray = this.fb.array(skillEntry.items.map((item: string) => this.fb.control(item)));
              skillsGroup.addControl(skillEntry.category, categoryArray);
            } else if (skillEntry.category && skillEntry.name) {
              // Format: {category: string, name: string}
              let categoryArray = skillsGroup.get(skillEntry.category) as FormArray;
              if (!categoryArray) {
                categoryArray = this.fb.array([]);
                skillsGroup.addControl(skillEntry.category, categoryArray);
              }
              categoryArray.push(this.fb.control(skillEntry.name));
            }
          });
        } else if (typeof data.skills === 'object') {
          // Format: {category1: string[], category2: string[]}
          console.log('Processing skills as category object');
          
          const skillsGroup = this.cvForm.get('skills') as FormGroup;
          
          // Clear existing skills
          Object.keys(skillsGroup.controls).forEach(key => {
            skillsGroup.removeControl(key);
          });
          
          // Process each category
          Object.entries(data.skills).forEach(([category, skills]) => {
            const skillsArray = Array.isArray(skills) ? skills : [skills];
            const categoryArray = this.fb.array(skillsArray.map(skill => this.fb.control(skill)));
            skillsGroup.addControl(category, categoryArray);
          });
        } else {
          console.warn('Skills has unknown format:', typeof data.skills);
        }
      }
      
      console.log('Form arrays updated successfully');
    } catch (error) {
      console.error('Error updating form arrays:', error);
    }
  }

  /**
   * Set values for a specific form array
   */
  private setFormArray(arrayName: string, values: any[]) {
    console.log(`Setting form array for ${arrayName} with ${values.length} values`);
    
    try {
      const formArray = this.cvForm.get(arrayName) as FormArray;
      if (!formArray) {
        console.error(`Form array '${arrayName}' not found in form`);
        return;
      }
      
      // Clear the existing form array
      while (formArray.length) {
        formArray.removeAt(0);
      }
      
      // Handle interests (which could be strings)
      if (arrayName === 'interests' && values.length > 0 && typeof values[0] === 'string') {
        values.forEach(interest => {
          formArray.push(this.fb.control(interest));
        });
        return;
      }
      
      // Handle special case for skills object format
      if (arrayName === 'skills' && !Array.isArray(values)) {
        console.log('Skills in object format, converting to array format');
        const skillsGroup = this.cvForm.get('skills') as FormGroup;
        Object.entries(values).forEach(([category, skills]) => {
          const skillsArray = Array.isArray(skills) ? skills : [skills];
          const categoryArray = this.fb.array(skillsArray.map(skill => this.fb.control(skill)));
          skillsGroup.addControl(category, categoryArray);
        });
        return;
      }
      
      // Add new form groups with the loaded values
      values.forEach(item => {
        try {
          const group = this.createFormGroupForArrayItem(arrayName, item);
          formArray.push(group);
        } catch (error) {
          console.error(`Error creating form group for ${arrayName}:`, error);
        }
      });
    } catch (error) {
      console.error(`Error in setFormArray for ${arrayName}:`, error);
    }
  }

  /**
   * Create a form group for a specific array item
   */
  private createFormGroupForArrayItem(arrayName: string, item: any): FormGroup {
    switch (arrayName) {
      case 'workExperiences':
        const workExpGroup = this.fb.group({
          company: [item.company || '', Validators.required],
          position: [item.position || '', Validators.required],
          startDate: [item.startDate || '', Validators.required],
          endDate: [item.endDate || ''],
          description: [item.description || ''],
          mainContributions: this.fb.array([]), // Initialize empty arrays
          techStack: this.fb.array([])
        });
        
        // Add main contributions if they exist
        if (item.mainContributions && Array.isArray(item.mainContributions)) {
          const mainContribArray = workExpGroup.get('mainContributions') as FormArray;
          item.mainContributions.forEach((contribution: string) => {
            mainContribArray.push(this.fb.control(contribution));
          });
        }
        
        // Add tech stack items if they exist
        if (item.techStack && Array.isArray(item.techStack)) {
          const techStackArray = workExpGroup.get('techStack') as FormArray;
          item.techStack.forEach((tech: string) => {
            techStackArray.push(this.fb.control(tech));
          });
        }
        
        return workExpGroup;
      
      case 'education':
        return this.fb.group({
          institution: [item.institution || '', Validators.required],
          degree: [item.degree || '', Validators.required],
          fieldOfStudy: [item.fieldOfStudy || ''],
          startDate: [item.startDate || '', Validators.required],
          endDate: [item.endDate || ''],
          description: [item.description || ''],
          thesis: [item.thesis || ''],
          supervisor: [item.supervisor || '']
        });
      
      case 'certifications':
        return this.fb.group({
          certificationName: [item.certificationName || item.name || '', Validators.required],
          institution: [item.institution || item.issuer || '', Validators.required],
          date: [item.date || '']
        });
      
      case 'languages':
        // Map the proficiency value to standardized format
        const proficiency = this.mapProficiencyValue(item.proficiency);
        console.log(`Mapping language proficiency for ${item.name || item.language}: ${item.proficiency} → ${proficiency}`);
        
        return this.fb.group({
          name: [item.name || item.language || '', Validators.required],
          institute: [item.institute || '', Validators.required],
          proficiency: [proficiency, Validators.required]
        });
      
      case 'interests':
        // Handle different interest format (string or object)
        if (typeof item === 'string') {
          return this.fb.group({
            name: [item, Validators.required]
          });
        }
        return this.fb.group({
          name: [item.name || '', Validators.required]
        });
      
      case 'skills':
        // Handle different skill format
        if (typeof item === 'string') {
          return this.fb.group({
            name: [item, Validators.required],
            category: [''],
            proficiency: [0]
          });
        }
        return this.fb.group({
          name: [item.name || '', Validators.required],
          category: [item.category || ''],
          proficiency: [item.proficiency || 0]
        });
      
      default:
        return this.fb.group({});
    }
  }

  // Method to handle date changes from the MonthYearPicker
  handleDateChange(control: AbstractControl | null, value: string): void {
    if (control) {
      control.setValue(value);
    }
  }

  // Custom converter for PrimeNG Calendar
  convertStringToCalendarDate(dateString: string): Date | null {
    return this.parseDate(dateString);
  }

  // Method to initialize the calendar date when adding new items
  addWorkExperience() {
    const workExp = this.createWorkExperienceGroup();
    this.workExperiencesArray.push(workExp);
  }

  addEducation() {
    const education = this.createEducationGroup();
    this.educationArray.push(education);
  }

  // Add methods
  addCertification() {
    this.certificationsArray.push(this.createCertificationGroup());
  }

  addLanguage() {
    this.languagesArray.push(this.createLanguageGroup());
  }

  // Remove methods
  removeWorkExperience(index: number) {
    this.workExperiencesArray.removeAt(index);
  }

  removeEducation(index: number) {
    this.educationArray.removeAt(index);
  }

  removeCertification(index: number) {
    this.certificationsArray.removeAt(index);
  }

  removeLanguage(index: number) {
    this.languagesArray.removeAt(index);
  }

  // Skills methods remain similar but work with FormGroup
  addSkillCategory(event: { value: string, chipInput: HTMLInputElement }) {
    const category = event.value.trim();
    if (category) {
      const skillsGroup = this.cvForm.get('skills') as FormGroup;
      skillsGroup.addControl(category, this.fb.array([]));
    }
    event.chipInput.value = '';
  }

  removeSkillCategory(category: string) {
    const skillsGroup = this.cvForm.get('skills') as FormGroup;
    skillsGroup.removeControl(category);
  }

  getSkillCategories(): string[] {
    const skillsGroup = this.cvForm.get('skills') as FormGroup;
    return Object.keys(skillsGroup.controls);
  }

  getSkillsForCategory(category: string): string[] {
    const skillsGroup = this.cvForm.get('skills') as FormGroup;
    const categoryArray = skillsGroup.get(category) as FormArray;
    if (!categoryArray) return [];
    return categoryArray.controls.map(control => control.value);
  }

  addSkill(event: { value: string, chipInput: HTMLInputElement }, category: string) {
    const value = event.value.trim();
    if (value) {
      const skillsGroup = this.cvForm.get('skills') as FormGroup;
      const categoryArray = skillsGroup.get(category) as FormArray;
      categoryArray.push(this.fb.control(value));
    }
    event.chipInput.value = '';
  }

  removeSkill(skillIndex: number, category: string) {
    const skillsGroup = this.cvForm.get('skills') as FormGroup;
    const categoryArray = skillsGroup.get(category) as FormArray;
    categoryArray.removeAt(skillIndex);
    if (categoryArray.length === 0) {
      this.removeSkillCategory(category);
    }
  }

  // Export JSON
  exportJSON() {
    if (this.cvForm.valid) {
      const dataStr = JSON.stringify(this.cvForm.value, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.cvForm.get('name')?.value + '.json';
      link.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert('Please fill in all required fields correctly before exporting.');
    }
  }

  // Generate CV
  generateCV() {
    this.submitted = true;
    
    if (this.cvForm.valid) {
      // Get form data
      const formData = this.cvForm.value;
      
      // Format skills data for the PDF view
      formData.skills = this.formatSkillsForPdfView();
      
      // Save to localStorage
      localStorage.setItem('cvData', JSON.stringify(formData));
      console.log('CV data saved with formatted skills:', formData.skills);
      
      // Navigate to the PDF view
      this.router.navigate(['/pdf-view']);
    } else {
      alert('Please fill in all required fields correctly before generating the CV.');
      // Scroll to the first invalid control
      const firstInvalidElement = document.querySelector('.ng-invalid');
      firstInvalidElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  /**
   * Format skills data for the PDF view component
   */
  private formatSkillsForPdfView(): any[] {
    const skillsGroup = this.cvForm.get('skills') as FormGroup;
    if (!skillsGroup) return [];
    
    // Convert from FormGroup format to array format expected by PDF view
    return Object.keys(skillsGroup.controls).map(category => {
      const categoryArray = skillsGroup.get(category) as FormArray;
      const items = categoryArray.controls.map(control => control.value);
      
      return {
        category: category,
        items: items
      };
    });
  }

  // Helper method to check if a field is invalid
  isFieldInvalid(fieldName: string): boolean {
    const field = this.cvForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched || this.submitted)) : false;
  }

  // Helper method to get error message
  getErrorMessage(fieldName: string): string {
    const control = this.cvForm.get(fieldName);
    if (!control) return '';
    
    if (control.hasError('required')) return 'This field is required';
    if (control.hasError('email')) return 'Please enter a valid email address';
    if (control.hasError('pattern')) {
      switch (fieldName) {
        case 'phone': return 'Please enter a valid phone number';
        case 'startDate':
        case 'endDate': return 'Please use MM/YYYY format';
        case 'proficiency': return 'Please use valid format (A1-C2 or Native)';
        default: return 'Invalid format';
      }
    }
    if (control.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Minimum length is ${minLength} characters`;
    }
    return '';
  }

  // Add missing methods for interests
  addInterest(event: { value: string, chipInput: HTMLInputElement }) {
    const value = event.value.trim();
    if (value) {
      const interestsArray = this.cvForm.get('interests') as FormArray;
      interestsArray.push(this.fb.control(value));
    }
    event.chipInput.value = '';
  }

  removeInterest(index: number) {
    const interestsArray = this.cvForm.get('interests') as FormArray;
    interestsArray.removeAt(index);
  }

  // Main Contributions Methods
  getMainContributions(expControl: AbstractControl): string[] {
    const mainContributions = expControl.get('mainContributions') as FormArray;
    if (!mainContributions) return [];
    return mainContributions.controls.map(control => control.value);
  }

  addContribution(experienceIndex: number, value: string, input: HTMLInputElement) {
    if (!value.trim()) return;
    
    const workExp = this.workExperiencesArray.at(experienceIndex);
    const mainContributions = workExp.get('mainContributions') as FormArray;
    
    if (mainContributions) {
      mainContributions.push(this.fb.control(value.trim()));
      input.value = '';
    }
  }

  removeContribution(experienceIndex: number, contributionIndex: number) {
    const workExp = this.workExperiencesArray.at(experienceIndex);
    const mainContributions = workExp.get('mainContributions') as FormArray;
    
    if (mainContributions) {
      mainContributions.removeAt(contributionIndex);
    }
  }

  // Tech Stack Methods
  getTechStack(expControl: AbstractControl): string[] {
    const techStack = expControl.get('techStack') as FormArray;
    if (!techStack) return [];
    return techStack.controls.map(control => control.value);
  }

  addTechItem(experienceIndex: number, value: string, input: HTMLInputElement) {
    if (!value.trim()) return;
    
    const workExp = this.workExperiencesArray.at(experienceIndex);
    const techStack = workExp.get('techStack') as FormArray;
    
    if (techStack) {
      techStack.push(this.fb.control(value.trim()));
      input.value = '';
    }
  }

  removeTechItem(experienceIndex: number, techIndex: number) {
    const workExp = this.workExperiencesArray.at(experienceIndex);
    const techStack = workExp.get('techStack') as FormArray;
    
    if (techStack) {
      techStack.removeAt(techIndex);
    }
  }

  // Map proficiency value to standardized format
  mapProficiencyValue(value: string | number): string {
    if (!value) return 'A1';
    
    if (typeof value === 'number') {
      // Map number scale (1-5) to CEFR levels
      const mappings = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const index = Math.min(Math.max(Math.floor(value) - 1, 0), 5);
      return mappings[index];
    }
    
    const valueLower = value.toString().toLowerCase();
    
    // Handle if already in correct format
    if (/^[a-c][1-2]$/i.test(value) || valueLower === 'native') {
      return value.toString().toUpperCase();
    }
    
    // Map text descriptions to CEFR levels
    if (valueLower.includes('beginner')) return 'A1';
    if (valueLower.includes('elementary')) return 'A2';
    if (valueLower.includes('intermediate') && valueLower.includes('upper')) return 'B2';
    if (valueLower.includes('intermediate')) return 'B1';
    if (valueLower.includes('advanced') || valueLower.includes('fluent')) return 'C1';
    if (valueLower.includes('proficient') || valueLower.includes('native')) return 'C2';
    
    // Default
    return 'B1';
  }

  // Toggle mobile menu visibility
  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }
}
