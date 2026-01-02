
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, Subject } from 'rxjs';
import { A2UIService } from '../shared/a2ui/a2ui.service';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private apiUrl = 'http://localhost:8000';
  private sessionId: string;

  // Subject to notify ChatComponent of responses from events
  public agentResponse = new Subject<string>();
  public bookingComplete = new Subject<boolean>();

  constructor(private http: HttpClient, private a2uiService: A2UIService) {
    this.sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
    
    // Subscribe to client events
    this.a2uiService.clientEvent.subscribe(event => {
        this.handleClientEvent(event);
    });
  }

  sendMessage(message: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/chat`, {
      query: message,
      session_id: this.sessionId
    }).pipe(
      tap(response => {
        // No global interception; handled by ChatComponent now
      })
    );
  }

  private handleClientEvent(event: { type: string, payload: any }) {
    console.log("Forwarding client event to agent:", event);

    // Intercept "book" action from card component
    if (event.type === 'cardAction' && event.payload?.action === 'book') {
        const surfaceId = event.payload.surfaceId;
        const surfaces = this.a2uiService.processorInstance.getSurfaces();
        const surface = surfaces.get(surfaceId);
        
        if (surface && surface.data && surface.data.cars) {
            const car = surface.data.cars.find((c: any) => c.id === event.payload.carId);
            if (car) {
                // Update this surface to include the booking context locally
                // We keep the type as 'card-comparison' to show the cards, but insert 'bookingContext'
                // which the CardComparisonComponent will render.
                this.a2uiService.processorInstance.processMessage({
                    action: 'surfaceUpdate',
                    surfaceId: surfaceId,
                    surfaceType: 'card-comparison',
                    data: {
                        ...surface.data,
                        bookingContext: {
                            carId: car.id,
                            make: car.make,
                            model: car.model,
                            year: car.year,
                            price: car.price,
                            image: car.image
                        }
                    }
                });
                return; // Do not send to server yet
            }
        }
    }

    // Fix: If this is a booking submission coming from the card component, it might still be labeled 'cardAction'.
    // We need to validly label it 'formSubmit' for the server to recognize it.
    let eventType = event.type;
    if (eventType === 'cardAction' && event.payload && event.payload.email) {
        eventType = 'formSubmit';
    }

    const startEvent = {
        type: eventType,
        payload: event.payload
    };
    
    this.sendMessage(`EVENT: ${JSON.stringify(startEvent)}`).subscribe({
         next: (res: any) => {
             if (res && (res.text || res.output)) {
                 const handled = this.a2uiService.handleResponse(res.text || res.output);
                 if (!handled) {
                     // It's a text response (e.g. confirmation), show it in chat
                     this.agentResponse.next(res.text || res.output);
                     if (eventType === 'formSubmit') {
                         this.bookingComplete.next(true);
                     }
                 }
             }
         },
         error: err => console.error("Failed to forward event", err)
    });
  }
}
