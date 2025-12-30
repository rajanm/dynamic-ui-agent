
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from '../chat/chat';


@Component({
  selector: 'app-gen-ui',
  standalone: true,
  imports: [CommonModule, ChatComponent],
  template: `
    <div class="h-full flex flex-col">
       <!-- Reusing ChatComponent but it renders surfaces inline (default) -->
       <!-- This effectively makes this tab identical to the main tab, but user asked for it -->
       <app-chat class="flex-1" [renderSurfaces]="true" title="Vehicle Agent - Generative UI"></app-chat>
    </div>
  `
})
export class GenUIComponent {
  // Logic moved to A2UIService and ChatComponent
}
