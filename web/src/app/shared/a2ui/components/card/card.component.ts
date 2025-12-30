
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-a2ui-card-comparison',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-6 p-6 border border-gray-200 rounded-xl bg-white shadow-sm max-w-4xl mx-auto my-4 overflow-x-auto">
      <!-- Verdict Section -->
      <div *ngIf="data.verdict" class="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h3 class="font-bold text-blue-800 mb-1">Comparison Verdict</h3>
        <p class="text-blue-700 leading-relaxed">{{data.verdict}}</p>
      </div>
      
      <!-- Cards Container - Explicit Grid -->
      <div class="comparison-grid">
        <div *ngFor="let card of data.cars" class="border border-gray-200 rounded-lg shadow-sm bg-white flex flex-col overflow-hidden hover:shadow-md transition-shadow">
          <!-- Card Content -->
          <div class="p-5 flex-grow">
            <!-- Header -->
            <div class="flex justify-between items-start mb-3">
              <div>
                 <h3 class="text-xl font-bold text-gray-900">{{card.make}} {{card.model}}</h3>
                 <span class="text-sm font-medium text-gray-500">{{card.type}} • {{card.year}}</span>
              </div>
              <div class="text-right">
                 <span class="block text-lg font-bold text-green-700">{{card.price}}</span>
              </div>
            </div>
            
            <!-- Color Badge -->
             <div class="mb-4">
               <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                 {{card.color}}
               </span>
            </div>

            <!-- Features -->
            <div class="space-y-2">
              <h4 class="font-semibold text-sm text-gray-900 uppercase tracking-wide">Key Features</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li *ngFor="let feature of card.features" class="flex items-start">
                  <span class="mr-2 text-blue-500">•</span>
                  {{feature}}
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
            <button (click)="onAction(card)" class="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 font-semibold transition-colors shadow-sm active:transform active:scale-95">
              Book Test Drive
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr; /* Force 2 equal columns */
      gap: 1.5rem; /* gap-6 equivalent */
      min-width: 600px;
    }
  `]
})
export class CardComparisonComponent {
  @Input() data: any; // { cars: [] }
  @Input() surfaceId!: string;
  @Output() clientEvent = new EventEmitter<any>();
  eventType = 'cardAction';

  onAction(card: any) {
    this.clientEvent.emit({ action: 'book', carId: card.id, surfaceId: this.surfaceId });
  }
}
