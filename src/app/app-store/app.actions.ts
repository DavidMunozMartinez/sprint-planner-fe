import { createAction, props } from "@ngrx/store";
import { Room, RoomTimer } from "../classes/room";
import { Voter } from "../classes/voter";

export const setRoom = createAction('SetRoom', props<{ room: Room }>())
export const setId = createAction('SetId', props<{ id: string }>())
export const setName = createAction('SetName', props<{ name: string }>())
export const setCachedRoomId = createAction('SetCachedRoomId', props<{ cachedRoomId: string }>())

type SetVoterProps<T extends keyof Voter> = { id: string, property: T, value: Voter[T] };
export const setVoterProp = <T extends keyof Voter>() => {
  return createAction('SetVoterProp', props<SetVoterProps<T>>())
}

export const addVoter = createAction('AddVoter', props<{ voter: Voter }>());

export const setRoomRevealed = createAction('SetRoomRevealed', props<{ revealed: boolean }>());

export const deleteVoter = createAction('DeleteVoter', props<{ voterId: string }>());

export const setRoomTimer = createAction('SetRoomTimer', props<{ timer: RoomTimer }>());