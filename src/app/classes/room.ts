import { ServerVoterData, Voter } from "./voter";

export type RoomState = {
  id: string,
  host: string,
  voters: Voter[],
  revealed: boolean
  timer: RoomTimer
}

export class Room {
  id: string = '';
  host: string = '';
  voters: Voter[] = [];
  revealed: boolean = false;
  timer: RoomTimer = {
    time: -1,
    current: -1,
    running: false,
  }

  constructor(id: string, host: string) {
    this.id = id;
    this.host = host;
  }
}

export type ServerRoomData = {
  id: string;
  host: string;
  voters: { [key: string]: ServerVoterData }
  revealed: boolean;
}

export type RoomTimer = {
  time: number,
  current: number,
  running: boolean,
}