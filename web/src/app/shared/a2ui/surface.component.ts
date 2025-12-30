
import { Component, Input, OnChanges, SimpleChanges, ViewContainerRef, ViewChild, Type, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageProcessor } from './message-processor';
import { TableComponent } from './components/table/table.component';
import { CardComparisonComponent } from './components/card/card.component';
import { FormComponent } from './components/form/form.component';

@Component({
  selector: 'app-a2ui-surface',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="a2ui-surface">
      <div #container></div>
      <!-- Fallback or debug info -->
      <div *ngIf="!hasRenderer" class="p-4 border border-dashed text-gray-400">
        Unknown surface type: {{ type }}
      </div>
    </div>
  `
})
export class SurfaceComponent implements OnChanges {
  @Input() surfaceId!: string;
  @Input() type!: string;
  @Input() data!: any;

  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;

  hasRenderer = false;


  constructor(private messageProcessor: MessageProcessor) {}

  ngOnInit() {
      // Subscribe to updates
      this.messageProcessor.surfacesChanged.subscribe(map => {
          const surface = map.get(this.surfaceId);
          if (surface) {
              // Update if changed
              if (surface.type !== this.type || JSON.stringify(surface.data) !== JSON.stringify(this.data)) {
                   this.type = surface.type;
                   this.data = surface.data;
                   this.render();
              }
          }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['type'] || changes['data']) {
      this.render();
    }
  }

  private render() {
    this.container.clear();
    this.hasRenderer = false;

    let componentType: Type<any> | null = null;
    switch (this.type) {
      case 'table':
        componentType = TableComponent;
        break;
      case 'card-comparison':
        componentType = CardComparisonComponent;
        break;
      case 'booking-form':
        componentType = FormComponent;
        break;
    }

    if (componentType) {
      const ref = this.container.createComponent(componentType);
      ref.instance.data = this.data;
      ref.instance.surfaceId = this.surfaceId; 
      
      // Subscribe to events if component has output
      if (ref.instance.clientEvent) {
          ref.instance.clientEvent.subscribe((payload: any) => {
              this.messageProcessor.sendClientEvent(ref.instance.eventType || 'unknown', payload);
          });
      }
      
      this.hasRenderer = true;
    }
  }
}
