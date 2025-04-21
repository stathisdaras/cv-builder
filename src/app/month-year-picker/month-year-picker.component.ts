import { Component, forwardRef, Input, Output, EventEmitter, ViewEncapsulation, LOCALE_ID, Inject, NO_ERRORS_SCHEMA } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormsModule, AbstractControl } from '@angular/forms';
import { CommonModule, getLocaleFirstDayOfWeek, formatDate } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-month-year-picker',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DatePickerModule
  ],
  templateUrl: './month-year-picker.component.html',
  styleUrl: './month-year-picker.component.css',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MonthYearPickerComponent),
      multi: true
    }
  ]
})
export class MonthYearPickerComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() yearRange: string = '1980:2030';
  @Input() invalid: boolean = false;
  @Input() errorMessage: string = '';
  @Input() allowPresent: boolean = false;
  @Input() dateValue: string = '';
  
  // Update type to accept AbstractControl or null
  @Input() formControl: AbstractControl | null = null;
  
  @Output() dateChange = new EventEmitter<string>();

  isPresent: boolean = false;
  
  constructor(
    @Inject(LOCALE_ID) private locale: string
  ) { }

  // ControlValueAccessor implementation
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.dateValue = value;
    this.isPresent = value === 'Present';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Handle disabled state
  }

  // Custom methods
  onDateSelect(event: Date): void {
    if (event) {
      const formattedDate = this.formatMonthYear(event);
      this.dateValue = formattedDate;
      this.onChange(formattedDate);
      this.dateChange.emit(formattedDate);
      
      // Update the form control if provided
      if (this.formControl && this.formControl.setValue) {
        this.formControl.setValue(formattedDate);
      }
    }
  }

  togglePresentCheckbox(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox) {
      this.isPresent = checkbox.checked;
      if (this.isPresent) {
        this.dateValue = 'Present';
        this.onChange('Present');
        this.dateChange.emit('Present');
        
        // Update the form control if provided
        if (this.formControl && this.formControl.setValue) {
          this.formControl.setValue('Present');
        }
      } else {
        this.dateValue = '';
        this.onChange('');
        this.dateChange.emit('');
        
        // Update the form control if provided
        if (this.formControl && this.formControl.setValue) {
          this.formControl.setValue('');
        }
      }
    }
  }

  formatMonthYear(date: Date): string {
    if (!date) return '';
    return formatDate(date, 'MMM yyyy', this.locale);
  }

  // Generate a safe ID from the label
  getSafeId(): string {
    if (!this.label) return 'date-picker';
    return 'present-checkbox-' + this.label.replace(/\s+/g, '-').toLowerCase();
  }
}
