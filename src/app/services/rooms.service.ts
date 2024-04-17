import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { UtilsService } from "./utils.service";
import { Room, ServerRoomData } from "../classes/room";
import { ServerVoterData, Voter } from "../classes/voter";
import { WSHandler } from "./ws-handler";

const SERVER = 'ws://localhost:3000'

@Injectable({
  providedIn: 'root'
})
export class RoomsService {

  id = '';
  name: string = '';
  ws: WebSocket | null = null;
  roomId: string = '';
  room: Room | null = null;

  private router = inject(Router)
  private http = inject(HttpClient)
  private utils = inject(UtilsService)
  private wsHandler = inject(WSHandler)

  constructor() {
    const storageName = localStorage.getItem('name');
    const storageId = localStorage.getItem('id');
    const storageRoomId = localStorage.getItem('roomId');

    if (storageName) {
      this.name = storageName;
    }
    if (storageId) {
      this.id = storageId;
    } else {
      this.id = this.utils.randString();
      localStorage.setItem('id', this.id);
    }

    if (storageRoomId) {
      this.roomId = storageRoomId;
    }
  }

  createRoom(name: string) {
    firstValueFrom(this.http.post('http://localhost:3000/room-create', JSON.stringify({
      id: this.id,
      name,
    }))).then((value: any) => {
      this.name = name;
      const roomId = value.roomId;
      localStorage.setItem('roomId', roomId);
      this.roomId = roomId;
      this.ws = new WebSocket(
        `${SERVER}/ws?room=${roomId}&id=${this.id}`
      );
      this.wsHandler.initListeners(this.ws);
    });
  }

  joinRoom(roomId: string, name: string) {
    firstValueFrom<{ room: ServerRoomData }>(
      this.http.post<{ room: ServerRoomData }>('http://localhost:3000/room-join', JSON.stringify({
        id: this.id,
        name,
        roomId,
    }))).then(({ room }) => {
      this.roomId = roomId;
      this.name = name;
      this.id = this.id;
      this.room = new Room(this.roomId, room.host);

      const voters = Object.values(room.voters) || []
      this.room.voters = voters.map((voter: ServerVoterData) => new Voter(voter))

      localStorage.setItem('roomId', roomId);
      this.ws = new WebSocket(
        `${SERVER}/ws?room=${roomId}&id=${this.id}`
      );
      this.wsHandler.initListeners(this.ws)
    });
  }

  getRoomData(roomId: string) {
    return firstValueFrom<{ room: ServerRoomData }>(this.http.post<{ room: ServerRoomData }>('http://localhost:3000/room-get', JSON.stringify({
      roomId
    })))
    .then(({ room }) => {
      this.room = new Room(room.id, room.host);
      this.room.revealed = room.revealed;
      const voters: Voter[] = Object
        .values(room.voters)
        .sort((a: ServerVoterData) => a.isHost ? -1 : 1)
        .map((voter) => new Voter(voter))
      this.room.voters = voters;
      if (!this.ws) {
        this.ws = new WebSocket(
          `${SERVER}/ws?room=${roomId}&id=${this.id}`
        );
        this.wsHandler.initListeners(this.ws);
      }
    })
    .catch((error) => {
      this.router.navigate(['/'])
      console.error(error);
    });
  }
}