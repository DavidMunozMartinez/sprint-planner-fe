import { Injectable, inject } from "@angular/core";
import { ServerVoterData, Voter } from "../classes/voter";
import { Store } from "@ngrx/store";
import { AppState } from "../app-store/app.store";
import { selectRoom } from "../app-store/app.selectors";
import { Room } from "../classes/room";
import { addVoter, setRoomRevealed, setVoterProp } from "../app-store/app.actions";

export type VoterJoinedWSData = {
  voter: ServerVoterData
}

export type VoterUpdatedWSData = {
  voterId: string;
  property: keyof Voter;
  value: any;
}

export type VotesRevelatedWSData = {
  votes: { [key: string]: number }
}
export type WSMessage = VoterJoinedWSData & VoterUpdatedWSData & VotesRevelatedWSData

@Injectable({
  providedIn: 'root'
})
export class WSEventsHandler {

  private store = inject(Store<AppState>)

  private room$ = this.store.select(selectRoom);
  private room: Room | null = null;
  constructor() {
    this.room$.subscribe((state) => {
      this.room = state;
    });
  }

  voterJoined(data: VoterJoinedWSData) {
    if (!this.room) return;

    const incommingVoter = data.voter;
    const voter = new Voter(incommingVoter);
    this.store.dispatch(addVoter({ voter }));
  }

  voterUpdated(data: VoterUpdatedWSData) {
    this.store.dispatch(setVoterProp<VoterUpdatedWSData['property']>()({ id: data.voterId, property: data.property, value: data.value }))
  }

  votesRevealed(data: VotesRevelatedWSData) {
    this.store.dispatch(setRoomRevealed({ revealed: true }));
    this.room?.voters.forEach((voter) => {
      this.store.dispatch(setVoterProp<"vote">()({ id: voter.id, property: "vote", value: data.votes[voter.id] }))
    });
  }

  votesReset() {
    this.store.dispatch(setRoomRevealed({ revealed: false }));
    this.room?.voters.forEach((voter) => {
      this.store.dispatch(setVoterProp<"vote">()({ id: voter.id, property: "vote", value: -1 }))
      this.store.dispatch(setVoterProp<"hasVoted">()({ id: voter.id, property: "hasVoted", value: false }))
    });
  }
}