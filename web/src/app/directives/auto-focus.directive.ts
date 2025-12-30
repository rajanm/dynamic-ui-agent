import { Directive, ElementRef, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
  standalone: true
})
export class AutoFocusDirective implements OnChanges, AfterViewInit {
  @Input('appAutoFocus') shouldFocus: boolean = true;

  constructor(private el: ElementRef) { }

  ngAfterViewInit() {
    if (this.shouldFocus) {
      this.focus();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['shouldFocus'] && this.shouldFocus) {
      this.focus();
    }
  }

  private focus() {
    // Small timeout to ensure DOM is ready and element is enabled
    setTimeout(() => {
      this.el.nativeElement.focus();
    }, 150);
  }
}
