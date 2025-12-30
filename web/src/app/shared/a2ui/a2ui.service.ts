
import { Injectable } from '@angular/core';
import { MessageProcessor, A2UIMessage } from './message-processor';

@Injectable({
  providedIn: 'root'
})
export class A2UIService {
  constructor(
      private processor: MessageProcessor
  ) {}

  public get processorInstance(): MessageProcessor {
    return this.processor;
  }

  public get clientEvent() {
      return this.processor.clientEvent;
  }

  // Called when agent sends a message that looks like A2UI JSON
  public handleResponse(text: string) {
    try {
      const json = JSON.parse(text);
      if (json.action && json.surfaceId) {
        this.processor.processMessage(json as A2UIMessage);
        return true; 
      }
    } catch (e) {
      // Not JSON or not A2UI
    }
    return false;
  }
}
