import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-popup.component.html',
  styleUrl: './custom-popup.component.scss'
})
export class CustomPopupComponent {
  /** Controls the visibility of the popup */
  @Input() isOpen = false;
  
  /** Event emitted when the popup is requested to close */
  @Output() closePopup = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  /**
   * Listen to global document clicks to close the popup if clicked outside.
   */
  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: MouseEvent): void {
    if (!this.isOpen) return;

    const popupCard = this.elementRef.nativeElement.querySelector('.custom-popup-card');
    const toggleButtons = document.querySelectorAll('.popup-trigger'); // Optional: Exclude trigger buttons

    // Check if the click was OUTSIDE the popup card
    if (popupCard && !popupCard.contains(event.target as Node)) {
      
      // Ensure we didn't just click the button that opens the popup
      let clickedOnTrigger = false;
      toggleButtons.forEach(btn => {
        if (btn.contains(event.target as Node)) clickedOnTrigger = true;
      });

      if (!clickedOnTrigger) {
        this.close();
      }
    }
  }

  close(): void {
    this.isOpen = false;
    this.closePopup.emit();
  }
}
