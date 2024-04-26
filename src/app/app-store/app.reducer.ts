import { ActionType} from "@ngrx/store";
import { addVoter, deleteVoter, setCachedRoomId, setId, setName, setRoom, setRoomRevealed, setVoterProp } from "./app.actions";
import { AppState } from "./app.store";
import { Room } from "../classes/room";
import { Voter } from "../classes/voter";

export function onSetRoom(state: AppState, action: ActionType<typeof setRoom>): AppState {
  return {
    ...state,
    ROOM: action.room,
  }
}

export function onSetId(state: AppState, action: ActionType<typeof setId>): AppState {
  return {
    ...state,
    ID: action.id,
  }
}

export function onSetName(state: AppState, action: ActionType<typeof setName>): AppState {
  return {
    ...state,
    NAME: action.name
  }
}

export function onSetCachedRoomId(state: AppState, action: ActionType<typeof setCachedRoomId>): AppState {
  return {
    ...state,
    CACHED_ROOM_ID: action.cachedRoomId
  }
}

const a = setVoterProp<any>();
export function onSetVoterProp(state: AppState, action: ActionType<typeof a>): AppState {
  const stateCopy: AppState = JSON.parse(JSON.stringify(state));
  const voters = stateCopy.ROOM.voters;
  const voter = voters.find(v => v.id === action.id);
  if (voter) {
    voter[action.property as keyof Voter] = action.value as never
  }

  return stateCopy
}

export function onAddVoter(state: AppState, action: ActionType<typeof addVoter>): AppState {
  const stateCopy: AppState = JSON.parse(JSON.stringify(state));
  const voters = stateCopy.ROOM.voters;
  const exists = voters.some((voter) => voter.id === action.voter.id)
  if (!exists) {
      voters.push(action.voter);
  }
  return stateCopy
}

export function onSetRoomRevealed(state: AppState, action: ActionType<typeof setRoomRevealed>): AppState {
  return {
    ...state,
    ROOM: {
      ...state.ROOM,
      revealed: action.revealed,
    }
  }
}

export function onDeleteVoter(state: AppState, action: ActionType<typeof deleteVoter>): AppState {
  const stateCopy: AppState = JSON.parse(JSON.stringify(state));
  const index = stateCopy.ROOM.voters.findIndex((voter) => voter.id === action.voterId);
  stateCopy.ROOM.voters.splice(index, 1);
  // stateCopy.ROOM.voters = voters;
  return stateCopy;
}
