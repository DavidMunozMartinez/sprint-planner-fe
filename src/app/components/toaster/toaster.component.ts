import { CommonModule } from "@angular/common";
import { Component, DestroyRef, ElementRef, inject, input, output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

type Toaster = {
  text: string,
  type: 'primary' | 'secondary'
}

@Component({
  selector: 'toaster-component',
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ToasterComponent {
  text = input.required<string>()
  type = input.required<'primary' | 'secondary'>()
  position = input.required<'top' | 'left' | 'bottom' | 'right'>()
  destroying = signal(false)

  private readonly host = inject(ElementRef<HTMLElement>)

  constructor() {
    setTimeout(() => {
      this.destroying.set(true);
      setTimeout(() => {
        this.host.nativeElement.remove()
      }, 200)
    }, 1800);
  }
}