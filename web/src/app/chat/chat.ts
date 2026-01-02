
import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentService } from '../services/agent';
import { A2UIService } from '../shared/a2ui/a2ui.service';
import { AutoFocusDirective } from '../directives/auto-focus.directive';
import { SurfaceComponent } from '../shared/a2ui/surface.component';

interface Message {
  text?: string;
  sender: 'user' | 'agent';
  type: 'text' | 'surface';
  surfaceId?: string;
  surfaceData?: any;
  surfaceType?: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoFocusDirective, SurfaceComponent],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent {
  @Input() renderSurfaces = false; // Default to false for "Conversational UI"
  @Input() title = 'Vehicle Shopping Agent - Conversational UI';
  messages: Message[] = [];
  newMessage: string = '';
  loading: boolean = false;

  constructor(
    private agentService: AgentService, 
    private cdr: ChangeDetectorRef,
    private a2uiService: A2UIService
  ) { 
      // Listen for text responses from events
      this.agentService.agentResponse.subscribe(text => {
          this.messages.push({ text: text, sender: 'agent', type: 'text' });
          this.cdr.detectChanges();
      });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    this.messages.push({ text: this.newMessage, sender: 'user', type: 'text' });
    const userMsg = this.newMessage;
    this.newMessage = '';
    this.loading = true;

    this.agentService.sendMessage(userMsg).subscribe({
      next: (response: any) => {
        console.log('Received response from agent:', response);

        if (!response) {
            this.handleError("Received empty response from server.");
            return;
        }

        let text = response.text || response.output || "";
        
        if (!text) {
             this.handleError("Sorry, I couldn't generate a response.");
             return;
        }

        // Parse for A2UI JSON
        try {
            const trimmed = text.trim();
            if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                const json = JSON.parse(trimmed);
                if (json.action && json.surfaceId) {
                    // Update global state
                    this.a2uiService.processorInstance.processMessage(json);

                    if (json.action === 'beginRendering') {
                        if (this.renderSurfaces) {
                            this.messages.push({
                                sender: 'agent',
                                type: 'surface',
                                surfaceId: json.surfaceId,
                                surfaceType: json.surfaceType,
                                surfaceData: json.data
                            });
                        } else {
                            // Text-only mode: Convert surface data to text
                            const textFallback = this.formatSurfaceAsText(json.surfaceType, json.data);
                            this.messages.push({
                                sender: 'agent',
                                type: 'text',
                                text: textFallback
                            });
                        }
                        this.loading = false;
                        this.cdr.detectChanges();
                    } else {
                         // surfaceUpdate or others: Hidden update
                         // The SurfaceComponent will subscribe and update itself.
                         // We might want to clear loading if it was "loading" waiting for this?
                         if (this.loading) {
                             this.loading = false;
                             this.cdr.detectChanges();
                         }
                    }
                    return;
                }
            }
        } catch (e) {
            // Not JSON
        }

        this.messages.push({ text: text, sender: 'agent', type: 'text' });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.handleError('Error interacting with agent.');
      }
    });
  }

  clearMessages() {
    this.messages = [];
    this.cdr.detectChanges();
  }

  private formatSurfaceAsText(type: string, data: any): string {
      if (type === 'table') {
          // data: { columns: [], rows: [] }
          if (!data || !data.columns || !data.rows) return JSON.stringify(data);
          let output = "Here are the results:\n\n";
          // Header
          output += data.columns.join(" | ") + "\n";
          output += data.columns.map(() => "---").join("|") + "\n";
          // Rows
          data.rows.forEach((row: any) => {
              // Row is an object, need to map columns to values
              const values = data.columns.map((col: string) => {
                  const key = col.toLowerCase();
                  return row[key] !== undefined ? row[key] : '';
              });
              output += values.join(" | ") + "\n";
          });
          return output;
      } else if (type === 'card-comparison') {
          // data: { verdict: string, cars: [] }
          let output = "";
          if (data.verdict) {
              output += `**Verdict:** ${data.verdict}\n\n`;
          }
          if (data.cars && Array.isArray(data.cars)) {
              data.cars.forEach((car: any) => {
                  output += `### ${car.make} ${car.model} (${car.year})\n`;
                  output += `Price: ${car.price}\n`;
                  output += `Type: ${car.type}\n`;
                  output += `Color: ${car.color}\n`;
                  if (car.features && Array.isArray(car.features)) {
                      output += `Features: ${car.features.join(", ")}\n`;
                  }
                  output += "\n";
              });
          }
          return output;
      }
      // Fallback
      return JSON.stringify(data, null, 2);
  }

  private handleError(msg: string) {
      this.messages.push({ text: msg, sender: 'agent', type: 'text' });
      this.loading = false;
      this.cdr.detectChanges();
  }
}
