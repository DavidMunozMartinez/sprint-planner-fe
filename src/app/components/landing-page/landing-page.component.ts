import { ChangeDetectionStrategy, Component, WritableSignal, inject, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { RoomsService } from "../../services/rooms.service";
import { FormsModule } from "@angular/forms";
import { ToasterComponent } from "../toaster/toaster.component";

@Component({
  selector: 'landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  standalone: true,
  imports: [FormsModule, ToasterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent {

  name: WritableSignal<string> = signal('')
  roomId: WritableSignal<string> = signal('')

  private route = inject(ActivatedRoute)
  private roomsService = inject(RoomsService)

  async ngOnInit() {
    const params = await firstValueFrom(this.route.queryParams);
    if (params['room']) {
      this.roomId.set(params['room']);
      this.joinRoom()
    }
    if (this.roomsService.name) {
      this.name.set(this.roomsService.name);
    }
  }

  createRoom(){
    if (!this.name()) return;

    localStorage.setItem('name', this.name());
    this.roomsService.createRoom(this.name());
  }

  joinRoom() {
    if (!this.roomId() || !this.name()) return;

    this.roomsService.joinRoom(this.roomId(), this.name());
  }

  updateRoom(event: Event) {
    this.roomId.set((event.target as HTMLInputElement).value);
  }

  updateName(event: Event) {
    this.name.set((event.target as HTMLInputElement).value)
  }

}