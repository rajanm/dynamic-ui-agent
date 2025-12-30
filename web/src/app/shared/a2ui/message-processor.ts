
import { Injectable, EventEmitter } from '@angular/core';

export interface A2UIMessage {
  action: 'beginRendering' | 'surfaceUpdate' | 'dataModelUpdate' | 'deleteSurface';
  surfaceId: string;
  surfaceType: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class MessageProcessor {
  // Map of surfaceId -> { type, data }
  private surfaces = new Map<string, { type: string, data: any }>();
  
  // Event emitter to notify components of updates
  public surfacesChanged = new EventEmitter<Map<string, { type: string, data: any }>>();
  
  // Event emitter for client events (to be sent to server)
  public clientEvent = new EventEmitter<{ type: string, payload: any }>();

  processMessage(message: A2UIMessage) {
    console.log('Processing A2UI Message:', message);
    switch (message.action) {
      case 'beginRendering':
      case 'surfaceUpdate':
        this.surfaces.set(message.surfaceId, { type: message.surfaceType, data: message.data });
        this.surfacesChanged.emit(new Map(this.surfaces)); // Emit copy
        break;
      case 'deleteSurface':
        this.surfaces.delete(message.surfaceId);
        this.surfacesChanged.emit(new Map(this.surfaces));
        break;
      // dataModelUpdate implementation omitted for brevity in this MVP
    }
  }

  getSurfaces() {
    return this.surfaces;
  }

  // Method for components to send events back to the agent
  sendClientEvent(type: string, payload: any) {
    console.log('Sending client event:', type, payload);
    this.clientEvent.emit({ type, payload });
  }
}
