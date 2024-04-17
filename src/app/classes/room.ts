import { ServerVoterData, Voter } from "./voter";

export class Room {
  id: string = '';
  host: string = '';
  voters: Voter[] = [];
  revealed: boolean = false;

  constructor(id: string, host: string) {
    this.id = id;
    this.host = host;
  }

  addVoter(voter: Voter) {
    const exists = this.voters.some((v) => v.id === voter.id)
    if (!exists) {
      this.voters.push(voter);
    }
  }
}

export type ServerRoomData = {
  id: string;
  host: string;
  voters: { [key: string]: ServerVoterData }
  revealed: boolean;
}