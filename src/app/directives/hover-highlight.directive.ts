import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appHoverHighlight]',
  standalone: true
})
export class HoverHighlightDirective {

  @HostBinding('style.--background') background: string = '';
  @HostBinding('style.--color') color: string = '';

  @HostListener('mouseenter') onMouseEnter() {
    this.background = '#252b44';  // Fundo azul escuro
    this.color = '#ffffff';        // Letra branca
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.background = '';
    this.color = '';
  }
}