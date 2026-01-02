
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AgentService } from '../../../../services/agent';
import { CommonModule } from '@angular/common';
import { FormComponent } from '../form/form.component';

@Component({
  selector: 'app-a2ui-card-comparison',
  standalone: true,
  imports: [CommonModule, FormComponent],
  template: `
    <div class="flex flex-col gap-6 p-6 border border-gray-200 bg-white shadow-sm max-w-4xl mx-auto my-4 overflow-x-auto" style="border-radius: 32px;">
      <!-- Verdict Section -->
      <div *ngIf="data.verdict" class="bg-blue-50 p-4 border border-blue-100" style="border-radius: 24px;">
        <h3 class="font-bold text-blue-800 mb-1">Comparison Verdict</h3>
        <p class="text-blue-700 leading-relaxed">{{data.verdict}}</p>
      </div>
      
      <!-- Cards Container - Explicit Grid -->
      <div class="relative">
        
        <div class="comparison-grid">
          <div *ngFor="let card of data.cars; let i = index" 
               class="border border-gray-200 shadow-sm flex flex-col overflow-hidden transition-all duration-300"
               style="border-radius: 24px;"
               [style.background-color]="i % 2 === 0 ? '#ffedd5' : '#dbeafe'"
               [class.opacity-50]="data.bookingContext && card.id !== data.bookingContext.carId"
               [class.grayscale]="data.bookingContext && card.id !== data.bookingContext.carId"
               [class.ring-2]="data.bookingContext && card.id === data.bookingContext.carId"
               [class.ring-blue-500]="data.bookingContext && card.id === data.bookingContext.carId"
               [class.ring-offset-2]="data.bookingContext && card.id === data.bookingContext.carId">
               
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
            <div class="p-4 bg-gray-50 border-t border-gray-100 mt-auto" style="display: flex; justify-content: center;">
              <button 
                  (click)="onAction(card)" 
                  [disabled]="data.bookingContext || isBooked"
                  [style.background-color]="(data.bookingContext || isBooked) ? '#94a3b8' : (i % 2 === 0 ? '#ea580c' : '#2563eb')"
                  [style.color]="'#ffffff'"
                  style="border-radius: 9999px; padding: 10px 32px;"
                  [class.opacity-50]="data.bookingContext || isBooked"
                  [class.cursor-not-allowed]="data.bookingContext || isBooked"
                  class="font-semibold transition-colors shadow-sm active:transform active:scale-95 hover:opacity-90">
                Book Test Drive
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Booking Form (Inline) -->
      <div *ngIf="data.bookingContext" class="mt-4 pt-6 border-t border-gray-200 animate-fade-in">
          <app-a2ui-form 
              [data]="data.bookingContext"
              [surfaceId]="surfaceId"
              [disabled]="isBooked"
              (clientEvent)="onFormEvent($event)">
          </app-a2ui-form>
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
    .animate-fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class CardComparisonComponent {
  @Input() data: any; // { cars: [], bookingContext?: any }
  @Input() surfaceId!: string;
  @Output() clientEvent = new EventEmitter<any>();
  eventType = 'cardAction';
  isBooked = false;
  private sub!: Subscription;

  constructor(private agent: AgentService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
      this.sub = this.agent.bookingComplete.subscribe(() => {
          this.isBooked = true;
          this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
      if (this.sub) this.sub.unsubscribe();
  }

  onAction(card: any) {
    this.clientEvent.emit({ action: 'book', carId: card.id, surfaceId: this.surfaceId });
  }

  onFormEvent(event: any) {
      if (event.surfaceId === this.surfaceId) {
          if (event.type === 'cancel') {
              this.data.bookingContext = null;
              return;
          }
          // Pass through events from the form
          this.clientEvent.emit(event);
      }
  }
}
