import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { UtilsService } from "./utils.service";
import { Room, ServerRoomData } from "../classes/room";
import { ServerVoterData, Voter } from "../classes/voter";
import { Store } from "@ngrx/store";
import { setCachedRoomId, setRoom } from "../app-store/app.actions";
import { AppState } from "../app-store/app.store";
import { PROD_API } from "../constants";

const SERVER = 'ws://localhost:3000'

@Injectable({
  providedIn: 'root'
})
export class RoomsService {

  private http = inject(HttpClient)
  private store = inject(Store<AppState>)

  constructor() {}

  // Returns roomId if successful
  createRoom(id: string, name: string): Promise<string> {
    return firstValueFrom<{ roomId: string }>(this.http.post<{ roomId: string }>(PROD_API + '/room-create', JSON.stringify({
      id,
      name,
    }))).then(({ roomId }) => {
      this.store.dispatch(setCachedRoomId({ cachedRoomId: roomId }))
      return roomId;
    })
  }

  // Returns full room if joined successful
  joinRoom(id: string, roomId: string, name: string): Promise<ServerRoomData> {
    return firstValueFrom<{ room: ServerRoomData }>(
      this.http.post<{ room: ServerRoomData }>(PROD_API + '/room-join', JSON.stringify({
        id,
        name,
        roomId,
    })))
    .then(({ room }) => {
      this.store.dispatch(setCachedRoomId({ cachedRoomId: roomId }))
      return room;
    })
  }

  // Returns room data
  getRoomData(roomId: string): Promise<ServerRoomData> {
    return firstValueFrom<{ room: ServerRoomData }>(this.http.post<{ room: ServerRoomData }>(PROD_API + '/room-get', JSON.stringify({
      roomId
    })))
    .then(({ room }) => {
      return room;
    })
  }

  closeRoom(roomId: string) {
    return firstValueFrom(this.http.post(PROD_API + '/room-delete', JSON.stringify({
      roomId
    })))
    .then(() => {
      // return room;
    })
  }

  leaveRoom(roomId: string) {
    return firstValueFrom(this.http.post(PROD_API + '/room-leave', JSON.stringify({
      roomId
    })))
    .then(() => {
      // return room;
    })
  }

  setServerRoomData(serverRoom: ServerRoomData) {
    const voters = (Object
      .values(serverRoom.voters) || [])
      .sort((a: ServerVoterData) => a.isHost ? -1 : 1)
      .map((voter) => {
        const v = new Voter(voter)
        v.isHost = v.id === serverRoom.host
        return v
      });
    const room = new Room(serverRoom.id, serverRoom.host);
    room.revealed = serverRoom.revealed;
    room.voters = voters;
    this.store.dispatch(setRoom({ room }));
  }
}