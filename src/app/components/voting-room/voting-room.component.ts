import { Component, computed, effect, inject, signal, viewChild } from "@angular/core";
import { RoomsService } from "../../services/rooms.service";
import { WSHandler } from "../../services/ws-handler";
import { firstValueFrom } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { StatisticsComponent } from "../statistics-component/statistics.component";
import { Store } from "@ngrx/store";
import { selectCachedRoomId, selectId, selectName, selectRoom, selectRoomTimerCurrent, selectRoomTimerRunning, selectRoomTimerValue } from "../../app-store/app.selectors";
import { AppState } from "../../app-store/app.store";
import { setCachedRoomId, setRoomTimer, setVoterProp } from "../../app-store/app.actions";
import { Router } from "@angular/router";
import { ToasterComponent, ToasterInputs } from "../toaster/toaster.component";
import { PROD_API } from "../../constants";
@Component({
  selector: 'voting-room',
  templateUrl: './voting-room.component.html',
  styleUrls: ['./voting-room.component.scss'],
  standalone: true,
  imports: [StatisticsComponent, ToasterComponent],
})
export class VotingRoomComponent {

  private roomsService = inject(RoomsService);
  private wsHandler = inject(WSHandler);
  private http = inject(HttpClient);
  private store = inject(Store<AppState>)
  private router = inject(Router)

  private statsComponent = viewChild<StatisticsComponent>(StatisticsComponent);

  private emojis = [
    '1fae5',
    '1f910',
    '1fae3',
    '1f636_200d_1f32b_fe0f',
    '1f636',
    '1fae2'
  ];

  private timerClicked = false;

  options = [0.5, 1, 2, 3, 5, 8, 13, 21]
  name = this.store.selectSignal(selectName);
  room = this.store.selectSignal(selectRoom)
  id = this.store.selectSignal(selectId)
  modal = signal("")
  me = computed(() => {
    const me = this.room().voters.find((voter) => voter.id === this.id())
    return me || null;
  });

  statisticsData = computed(() => this.room().voters.map((voter) => {
    return {
      name: voter.name || '',
      value: voter.vote
    }
  }));

  timerValue = signal(5);
  timerProgress = this.store.selectSignal(selectRoomTimerCurrent);
  timerRunning = this.store.selectSignal(selectRoomTimerRunning);

  frequencies = computed(() => {
    const stats = this.statsComponent();
    const frequencies = stats?.frequencies();
    return Object.values(frequencies || {}).length
  });

  fullScreenEmoji = computed(() => {
    const room = this.room();
    if (!room.revealed) {
      return null;
    }
    const agreement = room.voters.length > 0 && room.voters
      .every((voter, _, voters) => voter.vote === voters[0].vote && voter.vote > 0)
    
    if (agreement) {
      // Party emoji
      return {
        emoji: '1f973',
        title: 'Full team agreement'
      }
    }

    if (this.frequencies() > 3) {
      return {
        emoji: '1f615',
        title: ''
      }
    }

    return null;

  });

  votersDisplay = computed(() => {
    return this.room().voters.map((voter) => {
      const emoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
      return voter.vote > 0 ? voter.vote : emoji
    })
  })

  constructor() {
    this.wsHandler.on('timerUpdate', ({timer}) => {
      if (timer.current <= 0) {
        this.timerClicked = false;
        this.revealVotes();
      }
    })
  }

  async ngOnInit() {
    const cachedRoomId = this.store.selectSignal(selectCachedRoomId)();

    const id = this.id();
    if (cachedRoomId && id && !this.wsHandler.connected) {
      try {
        await this.handleAutoJoin(cachedRoomId, id);
      } catch (error) {
        this.router.navigate(['/'])
      }
    }
  }

  updateMyVote(value: number) {
    const room = this.room();
    const me = this.me();
    if (!me || room.revealed) return;

    firstValueFrom(
      this.http.post(PROD_API + '/update-vote', JSON.stringify({
        voterId: me.id,
        roomId: room.id,
        value,
    }))).then((data: any) => {
      const vote = value == me.vote ? -1 : value;
      this.store.dispatch(setVoterProp<"vote">()({ id: me.id, property: "vote", value: vote }))
    });
  }

  revealVotes() {
    const room = this.room();
    if (room.revealed) {
      return;
    }
    firstValueFrom(
      this.http.post(PROD_API + '/reveal-votes', JSON.stringify({
        roomId: room.id,
    }))).then((data: any) => {
    });
  }

  resetVotes() {
    const room = this.room();
    firstValueFrom(
      this.http.post(PROD_API + '/reset-votes', JSON.stringify({
        roomId: room.id,
    }))).then((data: any) => {
    });
  }

  closeRoom() {
    const room = this.room();
    firstValueFrom(
      this.http.post(PROD_API + '/room-close', JSON.stringify({
        roomId: room.id,
    }))).then(() => {
      this.router.navigate(['/'])
    });
  }

  leaveRoom() {
    const room = this.room();
    firstValueFrom(
      this.http.post(PROD_API + '/room-leave', JSON.stringify({
        roomId: this.room().id,
        voterId: this.me()?.id || "",
    }))).then(() => {
      this.store.dispatch(setCachedRoomId({ cachedRoomId: "" }))
      this.router.navigate(['/']);
    });
  }

  copyLink() {
    const url = 'https://sprint-planner-fe.vercel.app?room=' + this.room().id;
    navigator.clipboard.writeText(url);
  }

  setTimer(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.timerValue.set(parseInt(value));
  }

  startTimer() {
    if (this.timerRunning() || this.timerClicked) {
      return;
    }

    this.timerClicked = true;
    const timer = {
      time: this.timerValue(),
      current: this.timerValue(),
      running: true,
    };

    this.roomsService.startRoomTimer(this.room().id, timer);
  }

  private async handleAutoJoin(cachedRoomId: string, id: string) {
    const serverRoom = await this.roomsService.getRoomData(cachedRoomId);
    this.roomsService.setServerRoomData(serverRoom);
    const room = this.room();
    const name = this.name();

    if (!name) {
      this.modal.set('pick-name')
      return;
    }

    const me = room.voters.find(voter => voter.id === id);
    if (!me) {
      // If we are not in the cached room, join
      await this.joinCachedRoom(room.id, id, name);
    }
    this.wsHandler.init(id, cachedRoomId);

    return true;
  }

  async joinCachedRoom(roomId: string, id: string, name: string) {
    const serverRoom = await this.roomsService.joinRoom(id, roomId, name);
    this.roomsService.setServerRoomData(serverRoom);
    // this.connected = true;
    return true;
  }
}