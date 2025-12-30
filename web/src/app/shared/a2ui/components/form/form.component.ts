
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-a2ui-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h3 class="text-lg font-bold mb-4">Book Test Drive - {{data.make}} {{data.model}}</h3>
      <form (submit)="onSubmit()">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="date">
            Date
          </label>
          <input [(ngModel)]="formData.date" name="date" type="date" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
            Email
          </label>
          <input [(ngModel)]="formData.email" name="email" type="email" placeholder="you@example.com" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
        </div>
        <div class="flex items-center justify-between">
          <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Confirm Booking
          </button>
        </div>
      </form>
    </div>
  `
})
export class FormComponent {
  @Input() data: any; // { carId: string, make: string, model: string }
  @Input() surfaceId!: string;
  @Output() clientEvent = new EventEmitter<any>();
  eventType = 'formSubmit';

  formData = {
    date: '',
    email: ''
  };

  onSubmit() {
    this.clientEvent.emit({ 
      carId: this.data.carId, 
      ...this.formData,
      surfaceId: this.surfaceId 
    });
  }
}
