import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { provideMarkdown } from 'ngx-markdown';

import { ChatComponent } from './chat';
import { AgentService } from '../services/agent';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let mockAgentService: any;

  beforeEach(async () => {
    mockAgentService = {
      sendMessage: () => of({ text: 'Mock response' }),
      agentResponse: of('Mock agent response').pipe(delay(0))
    };

    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [
        { provide: AgentService, useValue: mockAgentService },
        provideMarkdown()
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clear messages when clearMessages is called', () => {
    component.messages = [
      { sender: 'user', type: 'text', text: 'Hello' },
      { sender: 'agent', type: 'text', text: 'Hi there' }
    ];
    expect(component.messages.length).toBe(2);
    
    component.clearMessages();
    
    expect(component.messages.length).toBe(0);
  });

});
