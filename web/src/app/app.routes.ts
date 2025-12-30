import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat';
import { GenUIComponent } from './gen-ui/gen-ui.component';

export const routes: Routes = [
  { path: '', component: ChatComponent },
  { path: 'gen-ui', component: GenUIComponent },
  { path: '**', redirectTo: '' }
];
