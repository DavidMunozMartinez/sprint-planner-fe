import { createReducer, on } from "@ngrx/store";
import { addVoter, deleteVoter, setCachedRoomId, setId, setName, setRoom, setRoomRevealed, setRoomTimer, setVoterProp } from "./app.actions";
import { onAddVoter, onDeleteVoter, onSetCachedRoomId, onSetId, onSetName, onSetRoom, onSetRoomRevealed, onSetRoomTimer, onSetVoterProp } from "./app.reducer";
import { Room, RoomState } from "../classes/room";
import { Voter } from "../classes/voter";

export type VoterState = {
  id: string;
  name: string;
  isHost: boolean;
  hasVoted: boolean;
  vote: number;
}

export type AppState = {
  ID: string | null,
  NAME: string | null,
  CACHED_ROOM_ID: string | null,
  ROOM: RoomState,
}

export const initialState: AppState = {
    ID: null,
    NAME: null,
    CACHED_ROOM_ID: null,
    ROOM: {
      id: "",
      host: "",
      revealed: false,
      voters: [],
      timer: {
        time: -1,
        current: -1,
        running: false,
      },
    }
}

export const appReducer = createReducer(
  initialState, 
  on(setRoom, onSetRoom),
  on(setId, onSetId),
  on(setName, onSetName),
  on(setCachedRoomId, onSetCachedRoomId),
  on(setVoterProp<any>(), onSetVoterProp),
  on(addVoter, onAddVoter),
  on(setRoomRevealed, onSetRoomRevealed),
  on(deleteVoter, onDeleteVoter),
  on(setRoomTimer, onSetRoomTimer),
)