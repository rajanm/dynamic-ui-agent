
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { A2UIService } from '../shared/a2ui/a2ui.service';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private apiUrl = 'http://localhost:8000';
  private sessionId: string;

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
    const startEvent = {
        type: event.type,
        payload: event.payload
    };
    
    this.sendMessage(`EVENT: ${JSON.stringify(startEvent)}`).subscribe({
         next: (res: any) => {
             if (res && (res.text || res.output)) {
                 this.a2uiService.handleResponse(res.text || res.output);
             }
         },
         error: err => console.error("Failed to forward event", err)
    });
  }
}
