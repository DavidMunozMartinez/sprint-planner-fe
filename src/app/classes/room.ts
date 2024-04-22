import { ServerVoterData, Voter } from "./voter";

export type RoomState = {
  id: string,
  host: string,
  voters: Voter[],
  revealed: boolean
}

export class Room {
  id: string = '';
  host: string = '';
  voters: Voter[] = [];
  revealed: boolean = false;

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