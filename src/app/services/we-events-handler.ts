import { Injectable } from "@angular/core";
import { ServerVoterData, Voter } from "../classes/voter";

export type VoterJoinedWSData = {
  voter: ServerVoterData
}

export type VoterUpdatedWSData = {
  voterId: string;
  property: keyof Voter;
  value: string;
}

export type VotesRevelatedWSData = {
  votes: { [key: string]: number }
}
export type WSMessage = VoterJoinedWSData & VoterUpdatedWSData & VotesRevelatedWSData

@Injectable({
  providedIn: 'root'
})
export class WSEventsHandler {

  // private roomsService = inject(RoomsService);

  constructor() {}

  voterJoined(data: VoterJoinedWSData) {
    // this.roomsService.room?.addVoter(new Voter(data.voter))
  }

  voterUpdated(data: VoterUpdatedWSData) {
    // console.log(data.property, data.value);
  }

  votesRevealed(data: VotesRevelatedWSData) {}

  votesReset() {}
}