
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-a2ui-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-xl mx-auto border border-gray-200 shadow-sm overflow-hidden my-4" style="background-color: #dcfce7; border-radius: 32px;">
      <!-- Header -->
      <div class="p-6 border-b border-green-100 flex items-center justify-between" style="background-color: #dcfce7; border-top-left-radius: 32px; border-top-right-radius: 32px;">
        <div>
          <h3 class="text-xl font-bold text-gray-900">Book Test Drive</h3>
          <p class="font-bold mt-1" style="color: #15803d;">{{data.make}} {{data.model}} <span class="text-sm font-normal" style="color: #22c55e;">• {{data.year}}</span></p>
        </div>
        <div class="text-right">
           <span class="block text-lg font-bold" style="color: #15803d;">{{data.price}}</span>
        </div>
      </div>

      <!-- Form -->
      <div class="p-6">
        <form (submit)="onSubmit()">
          
          <!-- Name Field -->
          <div class="mb-5">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="customer_name">
              Full Name
            </label>
            <input 
              [(ngModel)]="formData.customer_name" 
              name="customer_name" 
              type="text" 
              placeholder="John Doe" 
              required
              style="border-radius: 9999px; padding: 12px 16px;"
              [disabled]="disabled"
              [style.background-color]="disabled ? '#f3f4f6' : '#ffffff'"
              [style.color]="disabled ? '#9ca3af' : '#1f2937'"
              class="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder-gray-400"
            >
          </div>

          <!-- Email Field -->
          <div class="mb-5">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
              Email Address
            </label>
            <input 
              [(ngModel)]="formData.email" 
              name="email" 
              type="email" 
              placeholder="you@company.com" 
              required
              style="border-radius: 9999px; padding: 12px 16px;"
              [disabled]="disabled"
              [style.background-color]="disabled ? '#f3f4f6' : '#ffffff'"
              [style.color]="disabled ? '#9ca3af' : '#1f2937'"
              class="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder-gray-400"
            >
          </div>

          <!-- Date Field -->
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="date">
              Preferred Date
            </label>
            <input 
              [(ngModel)]="formData.date" 
              name="date" 
              type="date" 
              required
              style="border-radius: 9999px; padding: 12px 16px;"
              [disabled]="disabled"
              [style.background-color]="disabled ? '#f3f4f6' : '#ffffff'"
              [style.color]="disabled ? '#9ca3af' : '#374151'"
              class="w-full border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-700"
            >
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              (click)="onCancel()"
              [disabled]="disabled"
              style="border-radius: 9999px; padding: 10px 32px;"
              [style.background-color]="disabled ? '#f3f4f6' : '#ffffff'"
              [style.color]="disabled ? '#9ca3af' : '#374151'"
              class="border border-gray-300 hover:bg-gray-50 font-medium transition-colors"
              [class.cursor-not-allowed]="disabled"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              [disabled]="!isValid() || disabled"
              style="border-radius: 9999px; padding: 10px 32px; color: #ffffff;"
              [style.background-color]="(disabled || !isValid()) ? '#94a3b8' : '#15803d'"
              [class.opacity-50]="!isValid() && !disabled"
              [class.cursor-not-allowed]="!isValid() || disabled"
              class="font-semibold shadow-sm transition-all transform active:scale-95 hover:opacity-90"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class FormComponent {
  @Input() data: any; // { carId, make, model, year, price, image }
  @Input() surfaceId!: string;
  @Input() disabled = false;
  @Output() clientEvent = new EventEmitter<any>();
  eventType = 'formSubmit';

  formData = {
    customer_name: '',
    date: '',
    email: ''
  };

  isValid() {
    return this.formData.customer_name && this.formData.email && this.formData.date;
  }

  onSubmit() {
    if (this.isValid()) {
      this.clientEvent.emit({ 
        carId: this.data.carId, 
        ...this.formData,
        surfaceId: this.surfaceId 
      });
    }
  }

  onCancel() {
     this.clientEvent.emit({
         type: 'cancel',
         surfaceId: this.surfaceId
     });
  }
}
