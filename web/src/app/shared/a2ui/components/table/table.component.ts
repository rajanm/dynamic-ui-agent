
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-a2ui-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th *ngFor="let col of data.columns">
              {{col}}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of data.rows" (click)="onRowClick(row)" class="cursor-pointer">
            <td *ngFor="let col of data.columns">
              {{row[col.toLowerCase()] || row[col]}}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      border: 1px solid #ccc; /* Fallback */
      border: 1px solid var(--md-sys-color-outline);
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5; /* Fallback */
      background-color: var(--md-sys-color-surface-variant);
      font-weight: bold;
      text-transform: capitalize;
    }
    tr:hover {
      background-color: rgba(0,0,0,0.05);
    }
  `]
})
export class TableComponent {
  @Input() data: any; // { columns: string[], rows: any[] }
  @Input() surfaceId!: string;
  @Output() clientEvent = new EventEmitter<any>();
  eventType = 'rowSelect';

  onRowClick(row: any) {
    // Send back the selected car ID
    this.clientEvent.emit({ carId: row.id, surfaceId: this.surfaceId });
  }
}
