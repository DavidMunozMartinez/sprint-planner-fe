import { ChangeDetectionStrategy, Component, WritableSignal, inject, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { RoomsService } from "../../services/rooms.service";
import { FormsModule } from "@angular/forms";
import { ToasterComponent } from "../toaster/toaster.component";
import { ServerRoomData } from "../../classes/room";
import { WSHandler } from "../../services/ws-handler";
import { Store } from "@ngrx/store";
import { AppState } from "../../app-store/app.store";
import { selectCachedRoomId, selectId, selectName } from "../../app-store/app.selectors";
import { setCachedRoomId, setName } from "../../app-store/app.actions";

type Modal = 'pick-name'

@Component({
  selector: 'landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  standalone: true,
  imports: [FormsModule, ToasterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent {

  private store = inject(Store<AppState>);

  name = this.store.selectSignal(selectName);
  id = this.store.selectSignal(selectId);
  roomId: WritableSignal<string> = signal('')
  modal = signal<Modal | null>(null);

  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private roomsService = inject(RoomsService)
  private wsHandler = inject(WSHandler);

  async ngOnInit() {
    const cachedRoomId = this.store.selectSignal(selectCachedRoomId)();
    const params = await firstValueFrom(this.route.queryParams);
    const urlRoomId = params['room'] || null;

    const autoJoinRoomId = urlRoomId ? urlRoomId : cachedRoomId;
    if (autoJoinRoomId) {
      this.roomId.set(autoJoinRoomId);
      this.joinRoom();
    }
  }

  async createRoom(){
    const id = this.id();
    const name = this.name();

    if (!id) return;

    if (!name) {
      this.modal.set('pick-name')
      return;
    }

    try {
      const roomId = await this.roomsService.createRoom(id, name);
      const room = await this.roomsService.getRoomData(roomId);
      this.successfulRoom(id, room);
    } catch (error) {
      console.error(error);
    }
  }

  async joinRoom() {
    const id = this.id();
    const name = this.name();
    const roomId = this.roomId();

    if (!roomId || !id) return;

    if (!name) {
      this.modal.set('pick-name')
      return;
    }

    try {
      const room = await this.roomsService.joinRoom(id, roomId, name);
      this.successfulRoom(id, room);
    } catch (error) {
      // Show, couldn't join room
      console.error(error);
      this.roomId.set("");
      this.store.dispatch(setCachedRoomId({ cachedRoomId: "" }))
    }
  }

  private successfulRoom(id: string, room: ServerRoomData) {
    this.roomsService.setServerRoomData(room);
    this.wsHandler.init(id, room.id);
    this.router.navigate(['room'])
  }

  updateRoom(event: Event) {
    this.roomId.set((event.target as HTMLInputElement).value);
  }

  updateName(event: Event) {
    this.store.dispatch(setName({ name: (event.target as HTMLInputElement).value }))
  }

}