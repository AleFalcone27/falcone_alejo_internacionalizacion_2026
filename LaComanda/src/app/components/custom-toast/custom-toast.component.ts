import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-custom-toast',
  templateUrl: './custom-toast.component.html',
  styleUrls: ['./custom-toast.component.scss'],
  imports: [CommonModule]
})
export class CustomToastComponent {
  @Input() message = '';
  @Input() duration = 3000;

  visible = false;
  visibleGod = false;
  messageGod = '';

  show(message: string, duration = 3000) {
    this.message = message;
    this.duration = duration;
    this.visible = true;
    setTimeout(() => this.visible = false, this.duration);
  }
  showGod(msg: string, duration = 3000) {
    this.messageGod = msg;
    this.visibleGod = true;
    setTimeout(() => this.visibleGod = false, duration);
  }
}
